package print

import (
	"fmt"
	"sync"

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

func (jm *JekyllManager) GetJekyll(user, repoUser, repoName string) (*Jekyll, error) {
	jm.lock.Lock()
	defer jm.lock.Unlock()

	um, ok := jm.servers[user]
	if !ok {
		um = map[string]map[string]*Jekyll{}
		jm.servers[user] = um
	}
	ru, ok := um[repoUser]
	if !ok {
		ru = map[string]*Jekyll{}
		um[repoUser] = ru
	}
	j, ok := ru[repoName]
	if !ok {
		repoDir, err := git.RepoDir(user, repoName)
		if nil != err {
			return nil, util.Error(err)
		}
		j = &Jekyll{
			RepoDir: repoDir,
			BaseUrl: fmt.Sprintf(`jekyll/%s/%s`, repoUser, repoName),
			Port:    jm.ports.Assign(),
			manager: jm,
			path:    [3]string{user, repoUser, repoName},
		}
		ru[repoName] = j
		if err := j.Start(); nil != err {
			return nil, err
		}
	}
	return j, nil
}

// Remove expects jm to be already locked, and removes the given
// jekyll instance from the manager
func (jm *JekyllManager) remove(j *Jekyll) {
	delete(jm.servers[j.path[0]][j.path[1]], j.path[2])
}
