package print

import (
	"fmt"
	"html/template"
	"io"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"os/exec"
	"regexp"
	"strconv"
	// "strings"
	"sync"
	"time"

	"github.com/golang/glog"

	"ebw/config"
	"ebw/util"
)

// Jekyll manages a Jekyll process
type Jekyll struct {
	ConfigFiles string
	BaseUrl     string
	RepoDir     string
	Port        int64

	server http.Handler
	cmd    *exec.Cmd

	lock        sync.Mutex
	lastRequest time.Time
	manager     *JekyllManager

	err error

	path [3]string

	ServerStarting bool

	output *OutErrMerge

	RestartPath string
}

func (j *Jekyll) SetError(err error) {
	j.lock.Lock()
	j.err = err
	j.lock.Unlock()
}

func (j *Jekyll) getBaseUrl() string {
	start, end := regexp.MustCompile(`^[/\s]+`), regexp.MustCompile(`[/\s]+$`)
	j.BaseUrl = start.ReplaceAllString(j.BaseUrl, ``)
	j.BaseUrl = end.ReplaceAllString(j.BaseUrl, ``)
	if 0 == len(j.BaseUrl) {
		return ``
	}
	return `/` + j.BaseUrl
}

// Runs RVM in the given directory with the given commands.
// Pipes stdout and stderr to os.Stdout and os.Stderr.
func Rvm(cout, cerr io.Writer, dir string, args ...string) *exec.Cmd {
	cargs := []string{config.Config.RubyVersion, `do`}
	cargs = append(cargs, args...)
	c := exec.Command(config.Config.Rvm, cargs...)
	c.Stdout, c.Stderr = cout, cerr
	c.Dir = dir
	glog.Infof(`Rvm %s: %s %v`, dir, config.Config.Rvm, cargs)
	return c
}

func (j *Jekyll) start(cout, cerr io.Writer) error {
	j.ServerStarting = true
	go func() {
		defer func() {
			j.lock.Lock()
			j.ServerStarting = false
			j.lock.Unlock()
		}()
		jout, jerr := io.MultiWriter(cout, j.output.Out), io.MultiWriter(cerr, j.output.Err)
		defer func() {
			j.output.Out.Close()
			j.output.Err.Close()
		}()
		if err := Rvm(jout, jerr, j.RepoDir, `gem`, `install`, `bundler`).Run(); nil != err {
			j.SetError(err)
			util.Error(err)
			fmt.Fprintln(jerr, err.Error())
			return
		}
		if err := Rvm(jout, jerr, j.RepoDir, `bundle`, `install`).Run(); nil != err {
			j.SetError(err)
			util.Error(err)

			fmt.Fprintln(jerr, err.Error())
			return
		}
		j.cmd = Rvm(jout, jerr,
			j.RepoDir,
			`bundle`,
			`exec`,
			`jekyll`,
			`serve`,
			`--config`,
			`_config.yml,_configs/_config.web.yml,`+j.ConfigFiles,
			`--baseurl`,
			j.getBaseUrl(),
			`-P`,
			strconv.FormatInt(j.Port, 10),
			`--watch`)
		inR, _, err := os.Pipe()
		if nil != err {
			j.SetError(err)
			util.Error(err)
			fmt.Fprintln(jerr, err.Error())
			return
		}
		j.cmd.Stdin = inR
		if err := j.cmd.Start(); nil != err {
			j.SetError(err)
			util.Error(fmt.Errorf(`ERROR starting jeckyl: %s`, err.Error()))
			fmt.Fprintln(jerr, err.Error())
			return
		}
		go func() {
			ps, err := j.cmd.Process.Wait()
			if nil != err {
				j.SetError(err)
				util.Error(fmt.Errorf(`ERROR on jeckyll process Wait: %s`, err.Error()))
				return
			}
			if ps.Success() {
				j.SetError(fmt.Errorf(`Jekyll completed without error`))
			} else {
				j.SetError(fmt.Errorf(`Jekyll completed in an error state`))
			}
		}()

		targetUrl, err := url.Parse(fmt.Sprintf(`http://localhost:%d/`, j.Port))
		if nil != err {
			j.SetError(err)
			util.Error(err)
			fmt.Fprintln(jerr, err.Error())
			return
		}
		j.server = httputil.NewSingleHostReverseProxy(targetUrl)

		// We wait for the server to come up before we return
		tryCount := 0
		for {
			test, err := http.Get(targetUrl.String())
			if nil == err {
				test.Body.Close()
				break
			}
			tryCount++
			if 0 == tryCount%10 {
				glog.Infof(`Error trying to reach %s: %s`, targetUrl.String(), err.Error())
				if nil != j.err {
					// Error occurred on the server, we exit
					glog.Infof(`Jeckyll error - %s - so server ain't coming`, j.err.Error())
					return
				}
			}
			time.Sleep(time.Second)
		}
		glog.Infof(`Server is up on %s`, targetUrl.String())

		// Func to stop the server if it's inactive for 15 minutes
		go func() {
			t := time.NewTicker(time.Minute)
			for range t.C {
				// glog.Infof(`Checking time for jeckyl %s`, j.RepoDir)
				j.lock.Lock()
				maxDuration := 15
				if time.Now().Add(-1 * time.Duration(maxDuration) * time.Minute).After(j.lastRequest) {
					// glog.Infof(`Jekyll for %s has been inactive for %dm - shutting down`, j.RepoDir, maxDuration)
					j.shutdown()
					j.lock.Unlock()
					t.Stop()
					// glog.Infof(`Jekyll on %s has shut down`, j.RepoDir)
					return
				}
				j.lock.Unlock()
			}
		}()
	}()
	return nil
}

func (j *Jekyll) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	j.lock.Lock()
	defer j.lock.Unlock()
	inProcess := func() {
		_jekyllInProcess.Execute(w, map[string]interface{}{
			`Lines`:       j.output.Lines(),
			`Error`:       j.err,
			`Refresh`:     nil == j.err,
			`RestartPath`: j.RestartPath,
		})
	}
	if j.ServerStarting {
		inProcess()
		return
	}
	if nil == j.server {
		http.Error(w, `ERROR creating that server`, http.StatusInternalServerError)
		return
	}
	if nil != j.err {
		inProcess()
		return
	}
	j.server.ServeHTTP(w, r)
	j.lastRequest = time.Now()
}

func (j *Jekyll) shutdown() {
	j.manager.lock.Lock()
	defer j.manager.lock.Unlock()

	if err := j.cmd.Process.Signal(os.Interrupt); nil != err {
		glog.Errorf(`ERROR interrupting process for jekyll: %s`, err.Error)
	}
	glog.Infof(`os Interrupt sent to process`)
	// if err := j.cmd.Process.Kill(); nil != err {
	// 	glog.Errorf(`ERROR killing process for jeckyl: %s`, err.Error())
	// }
	if err := j.cmd.Wait(); nil != err {
		glog.Errorf(`ERROR waiting for jekyll for %s: %s`, j.RepoDir, err.Error())
	}
	glog.Infof(`shutdown should be done`)
	j.manager.ports.Release(j.Port)
	j.manager.remove(j)

}

var _jekyllInProcess = template.Must(template.New(``).Parse(`<!doctype HTML>
<html>
	<head>
	{{if .Error}}{{else -}}
  		<meta http-equiv="refresh" content="3">
  	{{end -}}
		<title>Jekyll building in progress...</title>
<style type="text/css">
.terminal {
	font-family: monospace;
	font-size: 0.8em;
	background-color: #333;
	color: #fff;
	padding: 1em;
}
.terminal .out {}
.terminal .err {
	background-color: #833;
	font-weight: bold;
}
main {
	max-width: 60em;
	margin: 1em auto;
}
.error {
	background-color: #933;
	color: white;
	font-weight: bold;
	font-family: monospace;
	padding: 1em;
}
.restart {
	margin: 1em 0;
	text-align: right;
}
.button {
	font-family: monospace;
	font-weight: bold;
	background-color: #999;
	color: white;
	padding: 0.6em 1em;
	box-sizing: border-box;
	display: inline-block;
	transition: background-color 0.3s;
	text-decoration: none;
}
.button:hover {
	background-color: #6b6;
}
</style>
	</head>
	<body>
		<main>
		{{if .Error}}
			<h1>Error starting Jekyll</h1>
			<div class="error">{{.Error}}</div>
			<div class="restart"><a class="button" href="{{.RestartPath}}">Try again</a></div>
		{{else}}
			<h1>Building in progress... autoreloading...</h1>
		{{end}}
			<p>process output:</p>
			<div class="terminal">
{{range .Lines}}
<div class="{{.Level}}">{{.Line}}</div>
{{- end}}
			</div>
		</main>
	</body>
</html>
`))
