package print

import (
	"fmt"
	"os"
	"sync"
	"time"

	"github.com/golang/glog"

	"ebw/git"
	"ebw/util"
)

var _ = glog.Info

// JekyllManager manages a bunch of Jekyll processes that will
// serve files for a repo. Importantly a Jekyll process needs
// to be started, build the repo, and automatically update if any
// files in the repo change.
type JekyllManager struct {
	lock    sync.Mutex
	servers map[string]map[string]map[string]*Jekyll
	ports   *JekyllPorts
}

func NewJekyllManager() *JekyllManager {
	return &JekyllManager{
		servers: map[string]map[string]map[string]*Jekyll{},
		ports:   NewJekyllPorts(),
	}
}

// ClearJekyll kills an existing jekyll process that might be serving the repo
func (jm *JekyllManager) ClearJekyll(user, repoOwner, repoName string) error {
	glog.Infof(`ClearJekyll(%s,%s,%s)`, user, repoOwner, repoName)
	jm.lock.Lock()
	defer jm.lock.Unlock()

	um, ok := jm.servers[user]
	if !ok {
		um = map[string]map[string]*Jekyll{}
		jm.servers[user] = um
	}
	ru, ok := um[repoOwner]
	if !ok {
		ru = map[string]*Jekyll{}
		um[repoOwner] = ru
	}
	j, ok := ru[repoName]
	if !ok {
		return nil
	}
	if nil != j {
		go j.Kill()
		// We allow it 1 second to die...
		time.Sleep(time.Second)
	}
	delete(ru, repoName)
	return nil
}

// GetJekyll returns the Jekyll server for the specific user, repoOwner and repoName
// combination, starting a new Jekyll server if necessary.
func (jm *JekyllManager) GetJekyll(user, repoOwner, repoName string) (*Jekyll, error) {
	jm.lock.Lock()
	defer jm.lock.Unlock()

	um, ok := jm.servers[user]
	if !ok {
		um = map[string]map[string]*Jekyll{}
		jm.servers[user] = um
	}
	ru, ok := um[repoOwner]
	if !ok {
		ru = map[string]*Jekyll{}
		um[repoOwner] = ru
	}
	j, ok := ru[repoName]

	if !ok {
		repoDir, err := git.RepoDir(user, repoOwner, repoName)
		if nil != err {
			return nil, util.Error(err)
		}
		j = &Jekyll{
			RepoDir: repoDir,
			BaseUrl: fmt.Sprintf(`jekyll/%s/%s`, repoOwner, repoName),
			Port:    jm.ports.Assign(),
			manager: jm,
			path:    [3]string{user, repoOwner, repoName},
			output:  NewOutErrMerge(),
			KILL:    make(chan bool, 1), // buffered channel so exited process won't cause issues
		}
		ru[repoName] = j
		if err := j.start(os.Stdout, os.Stderr); nil != err {
			return nil, err
		}
	}
	return j, nil
}

// remove expects jm to be already locked, and removes the given
// jekyll instance from the manager
func (jm *JekyllManager) remove(j *Jekyll) {
	delete(jm.servers[j.path[0]][j.path[1]], j.path[2])
}
