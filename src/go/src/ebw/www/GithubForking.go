package www

import (
	"strings"

	"github.com/golang/glog"
	"github.com/google/go-github/github"
)

var _ = glog.Infof

func githubCreateFork(c *Context) error {
	client := GithubClient(c.W, c.R)
	if nil == client {
		// GithubClient will have redirected us
		return nil
	}
	/** @TODO Need to add nonce to prevent issues */
	c.D[`RepoName`] = c.P(`repo_name`)
	c.D[`NewName`] = c.P(`new_name`)
	if "fork" != c.P(`action`) {
		return c.Render(`repo_fork.html`, nil)
	}
	parts := strings.Split(c.P(`repo_name`), `/`)
	repo, response, err := client.Repositories.CreateFork(parts[0], parts[1], &github.RepositoryCreateForkOptions{})
	if nil != err {
		return err
	}
	glog.Infof("RESPONSE = %v", response)
	glog.Infof("REPO = %v", repo)
	return c.Redirect(`/`)
}
