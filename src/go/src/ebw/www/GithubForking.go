package www

import (
	// "strings"

	"github.com/golang/glog"
	// "github.com/google/go-github/github"

	"ebw/git"
)

var _ = glog.Infof

func githubCreateFork(c *Context) error {
	client := GithubClient(c.W, c.R)
	if nil == client {
		// GithubClient will have redirected us
		return nil
	}
	token, err := git.GithubTokenFromWebRequest(c.R)
	if nil != err {
		return err
	}
	/** @TODO Need to add nonce to prevent issues */
	c.D[`RepoName`] = c.P(`repo_name`)
	c.D[`NewName`] = c.P(`new_name`)
	if "fork" != c.P(`action`) {
		return c.Render(`repo_fork.html`, nil)
	}

	if err := git.DuplicateRepo(c.R.Context(),
		client, token,
		c.P(`repo_name`), c.P(`new_name`)); nil != err {
		return err
	}

	return c.Redirect(`/`)
}
