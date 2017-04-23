package print

import (
	"fmt"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"os/exec"
	"regexp"
	"strconv"
	"sync"
	"time"

	"github.com/golang/glog"

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

func (j *Jekyll) start() error {
	j.cmd = exec.Command(
		`/usr/local/rvm/bin/rvm`,
		`2.3.0`,
		`do`,
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
		`--watch`,
	)
	j.cmd.Dir = j.RepoDir
	inR, _, err := os.Pipe()
	if nil != err {
		return util.Error(err)
	}
	j.cmd.Stdin = inR
	j.cmd.Stdout, j.cmd.Stderr = os.Stdout, os.Stderr

	if err := j.cmd.Start(); nil != err {
		return fmt.Errorf(`ERROR starting jeckyl: %s`, err.Error())
	}

	targetUrl, err := url.Parse(fmt.Sprintf(`http://localhost:%d/`, j.Port))
	if nil != err {
		return util.Error(err)
	}
	j.server = httputil.NewSingleHostReverseProxy(targetUrl)

	// We wait for the server to come up before we return
	for {
		test, err := http.Get(targetUrl.String())
		if nil == err {
			test.Body.Close()
			break
		}
		glog.Infof(`Error trying to reach %s: %s`, targetUrl.String(), err.Error())
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
