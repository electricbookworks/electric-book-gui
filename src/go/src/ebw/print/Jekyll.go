package print

import (
	"fmt"
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
	if err := Rvm(cout, cerr, j.RepoDir, `gem`, `install`, `bundler`).Run(); nil != err {
		j.err = err
		return err
	}
	if err := Rvm(cout, cerr, j.RepoDir, `bundle`, `install`).Run(); nil != err {
		j.err = err
		return err
	}
	j.cmd = Rvm(cout, cerr,
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
		j.err = err
		return util.Error(err)
	}
	j.cmd.Stdin = inR
	if err := j.cmd.Start(); nil != err {
		j.err = err
		return fmt.Errorf(`ERROR starting jeckyl: %s`, err.Error())
	}

	targetUrl, err := url.Parse(fmt.Sprintf(`http://localhost:%d/`, j.Port))
	if nil != err {
		j.err = err
		return util.Error(err)
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
		}
		time.Sleep(time.Second)
	}
	glog.Infof(`Server is up on %s`, targetUrl.String())

	go func() {
		t := time.NewTicker(time.Minute)
		for range t.C {
			glog.Infof(`Checking time for jeckyl %s`, j.RepoDir)
			j.lock.Lock()
			maxDuration := 15
			if time.Now().Add(-1 * time.Duration(maxDuration) * time.Minute).After(j.lastRequest) {
				glog.Infof(`Jekyll for %s has been inactive for %dm - shutting down`, j.RepoDir, maxDuration)
				j.shutdown()
				j.lock.Unlock()
				t.Stop()
				glog.Infof(`Jekyll on %s has shut down`, j.RepoDir)
				return
			}
			j.lock.Unlock()
		}
	}()

	return nil
}

func (j *Jekyll) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	j.lock.Lock()
	defer j.lock.Unlock()
	if nil == j.server {
		http.Error(w, `ERROR creating that server`, http.StatusInternalServerError)
		return
	}
	j.server.ServeHTTP(w, r)
	j.lastRequest = time.Now()
}

func (j *Jekyll) shutdown() {
	j.manager.lock.Lock()
	defer j.manager.lock.Unlock()

	if err := j.cmd.Process.Signal(os.Interrupt); nil != err {
		glog.Errorf(`ERROR interrupting process for jeckyl: %s`, err.Error)
	}
	glog.Infof(`os Interrupt sent to process`)
	// if err := j.cmd.Process.Kill(); nil != err {
	// 	glog.Errorf(`ERROR killing process for jeckyl: %s`, err.Error())
	// }
	if err := j.cmd.Wait(); nil != err {
		glog.Errorf(`ERROR waiting for jeckyl for %s: %s`, j.RepoDir, err.Error())
	}
	glog.Infof(`shutdown should be done`)
	j.manager.ports.Release(j.Port)
	j.manager.remove(j)

}
