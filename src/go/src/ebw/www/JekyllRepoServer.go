package www

import (
	"ebw/print"
	"fmt"
)

var jekyllManager *print.JekyllManager

func init() {
	jekyllManager = print.NewJekyllManager()
}

func jekyllRepoServerRestart(c *Context) error {
	var err error
	client := Client(c.W, c.R)
	if nil == client {
		// GithubClient will have redirected us
		return nil
	}
	repoOwner, repoName := c.Vars[`repoOwner`], c.Vars[`repoName`]
	err = jekyllManager.ClearJekyll(client.Username, repoOwner, repoName)
	if nil != err {
		return err
	}
	return c.Redirect(`/jekyll/%s/%s/%s`, repoOwner, repoName, c.Vars[`path`])
}

func jekyllRepoServer(c *Context) error {
	var err error
	client := Client(c.W, c.R)
	if nil == client {
		// GithubClient will have redirected us
		return nil
	}

	repoOwner := c.Vars[`repoOwner`]
	repoName := c.Vars[`repoName`]

	// glog.Infof(`Got jeckyl request for %s/%s/%s on path %s`, username, repoUser, repoName, c.Vars[`path`])

	// Ok, so now we've got a path on the Jekyll server
	// we want to serve
	j, err := jekyllManager.GetJekyll(client.Username, repoOwner, repoName)
	j.RestartPath = fmt.Sprintf(`/jekyll-restart/%s/%s/%s`, repoOwner, repoName, c.Vars[`path`])
	if nil != err {
		return err
	}
	j.ServeHTTP(c.W, c.R)
	return nil
}
