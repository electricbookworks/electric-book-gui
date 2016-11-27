package git

import (
	"io/ioutil"
	"os"
	"path/filepath"

	"github.com/golang/glog"
	"github.com/google/go-github/github"

	"ebw/config"
	"ebw/util"
)

func ListPullRequests(client *github.Client, user, repo string) ([]*github.PullRequest, error) {
	requests, _, err := client.PullRequests.List(user, repo, &github.PullRequestListOptions{})
	if nil != err {
		return nil, util.Error(err)
	}
	return requests, nil
}

func GetPullRequest(client *github.Client, user, repo string, number int) (*github.PullRequest, error) {
	pr, _, err := client.PullRequests.Get(user, repo, number)
	return pr, err
}

// PullRequestDir returns the local git_cache location for the given pull request, or
// if sha is an empty string, the root directory for all prrequest checkouts
func PullRequestDir(sha string) (string, error) {
	root, err := os.Getwd()
	if nil != err {
		return ``, util.Error(err)
	}
	prRoot := filepath.Join(root, config.Config.GitCache, `pr_requests`)
	if `` == sha {
		return prRoot, nil
	}
	return filepath.Join(prRoot, sha), nil
}

// PullRequestCheckout checks out the given remoteUrl with given sha
func PullRequestCheckout(remoteUrl, sha string) (string, error) {
	glog.Infof(`PullRequestCheckout(remote = %s, sha = %s)`, remoteUrl, sha)
	prRoot, err := PullRequestDir(``)
	os.MkdirAll(prRoot, 0755)
	_, err = os.Stat(filepath.Join(prRoot, sha))
	if nil == err {
		prRoot = filepath.Join(prRoot, sha)
		// Update from origin / master
		if err = runGitDir(prRoot, []string{`pull`, `origin`, `master`}); nil != err {
			return ``, err
		}
	} else {
		if !os.IsNotExist(err) {
			return ``, util.Error(err)
		}
		glog.Infof("Going to clone %s", remoteUrl)
		if err = runGitDir(prRoot, []string{`clone`, remoteUrl, sha}); nil != err {
			return ``, err
		}
		prRoot = filepath.Join(prRoot, sha)
	}

	if err = runGitDir(prRoot, []string{`checkout`, sha}); nil != err {
		return ``, err
	}
	return prRoot, nil
}

func PullRequestDiffList(client *github.Client, user, repo string,
	sha string, pathRegexp string) ([]*PullRequestDiff, error) {
	localPath, err := RepoDir(user, repo)
	if nil != err {
		return nil, err
	}
	remotePath, err := PullRequestDir(sha)
	if nil != err {
		return nil, err
	}
	diffs, err := GetPathDiffList(localPath, remotePath, pathRegexp)
	return diffs, err
}

func PullRequestUpdate(client *github.Client, user, repo string, sha string, path string, content []byte) error {
	localPath, err := RepoDir(user, repo)
	if nil != err {
		return err
	}
	if err := ioutil.WriteFile(filepath.Join(localPath, path), content, 0644); nil != err {
		return util.Error(err)
	}
	return nil
}

func PullRequestCreate(client *github.Client, user, repo, title, notes string) error {
	_, _, err := client.PullRequests.Create(user, repo,
		&github.NewPullRequest{
			Title: &title,
			Body:  &notes,
		})
	return util.Error(err)
}
