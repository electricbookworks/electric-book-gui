package git

import (
	"crypto/md5"
	"errors"
	"fmt"
	"io/ioutil"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"strconv"

	"github.com/golang/glog"
	"github.com/google/go-github/github"

	"ebw/config"
	"ebw/util"
)

// ErrUnknownUser indicates that Github was unable to resolve the user's name.
var ErrUnknownUser = errors.New(`UnknownUser: no recognized login or ID`)

// Username returns the username of the currently logged in user on GitHub.
func Username(client *github.Client) (string, error) {
	// Empty username gives the currently logged-in user
	user, _, err := client.Users.Get("")
	if nil != err {
		return ``, util.Error(err)
	}
	if nil != user.Login {
		return *user.Login, nil
	}
	if nil != user.ID {
		return strconv.FormatInt(int64(*user.ID), 10), nil
	}
	return ``, ErrUnknownUser
}

// RepoDir returns the local git_cache repo location.
func RepoDir(user, repo string) (string, error) {
	root, err := os.Getwd()
	if nil != err {
		return ``, util.Error(err)
	}
	root = filepath.Join(root, config.Config.GitCache, `repos`, user)
	if `` == repo {
		return root, nil
	}
	return filepath.Join(root, repo), nil
}

// runGit runs git in the user/repo directory with the given args, returning error
// on failure.
func runGit(user, repo string, args []string) error {
	root, err := RepoDir(user, repo)
	if nil != err {
		return err
	}
	return runGitDir(root, args)
}

func runGitDir(dir string, args []string) error {
	glog.Infof(`git command dir=%s, args = [%v]`, dir, args)
	cmd := exec.Command(`git`, args...)
	cmd.Dir = dir

	cmd.Stdout, cmd.Stderr = os.Stdout, os.Stderr
	return cmd.Run()
}

// Checkout checks out the github repo into the cached directory system,
// and returns the path to the root of the repo. If the client is already
// checked out, it updates from the origin server.
func Checkout(client *github.Client, user, name, url string) (string, error) {
	if `` == url {
		url = fmt.Sprintf(`https://github.com/%s/%s`, user, name)
	}
	glog.Infof(`Cloning/updating %s/%s from %s`, user, name, url)
	root, err := RepoDir(user, ``)
	if nil != err {
		return ``, util.Error(err)
	}
	os.MkdirAll(root, 0755)
	_, err = os.Stat(filepath.Join(root, name))
	if nil == err {
		return gitUpdate(client, filepath.Join(root, name))
	}
	if !os.IsNotExist(err) {
		return ``, util.Error(err)
	}

	cmd := exec.Command(`git`, `clone`, url+`.git`)
	cmd.Dir = root

	cmd.Stdout, cmd.Stderr = os.Stdout, os.Stderr
	return filepath.Join(root, name), cmd.Run()
}

// gitUpdate updates the files in the given repo root directory.
func gitUpdate(client *github.Client, root string) (string, error) {
	cmd := exec.Command(`git`, `pull`, `origin`, `master`)
	cmd.Dir = root
	cmd.Stdout, cmd.Stderr = os.Stdout, os.Stderr
	glog.Infof("dir = %s: git pull origin master", root)
	return root, cmd.Run()
}

// RemoteName returns a name for the remote based on the remoteUrl
func RemoteName(remoteUrl string) string {
	return fmt.Sprintf(`%x`, md5.Sum([]byte(remoteUrl)))
}

// RemoteAdd adds a new Remote to the git remotes
func RemoteAdd(client *github.Client, user, repo, remoteUrl string) (string, error) {
	remote := RemoteName(remoteUrl)
	return remote, runGit(user, repo, []string{`remote`, `add`, remote, remoteUrl})
}

// UrlUserRepo returns the user and repo given a github URL
func UrlUserRepo(remoteUrl string) (string, string, error) {
	reg := regexp.MustCompile(`github.com/([^/]+)/([^/]+)`)
	if m := reg.FindStringSubmatch(remoteUrl); nil != m {
		return m[1], m[2], nil
	}
	return ``, ``, fmt.Errorf(`repo %s is not a github repo`, remoteUrl)
}

// PullRequestVersions returns the local and remote version of the file named in filePath.
func PullRequestVersions(client *github.Client, user, repo, remoteUrl, remoteSha, filePath string) (string, string, error) {
	// We are sure this exists because of the point at which we call
	// this from the JS front-end

	// prRoot, err := PullRequestCheckout(remoteUrl, remoteSha)
	// if nil != err {
	// 	return ``, ``, err
	// }
	prRoot, err := PullRequestDir(remoteSha)
	if nil != err {
		return ``, ``, err
	}

	repoDir, err := RepoDir(user, repo)
	if nil != err {
		return ``, ``, err
	}

	localFileRaw, err := ioutil.ReadFile(filepath.Join(repoDir, filePath))
	if nil != err {
		if !os.IsNotExist(err) {
			return ``, ``, util.Error(err)
		}
		localFileRaw = []byte{}
	}

	remoteFileRaw, err := ioutil.ReadFile(filepath.Join(prRoot, filePath))
	if nil != err {
		if !os.IsNotExist(err) {
			return ``, ``, util.Error(err)
		}
		remoteFileRaw = []byte{}
	}

	return string(localFileRaw), string(remoteFileRaw), nil
}
