package www

import (
	"github.com/golang/glog"

	"ebw/print"
)

var jekyllManager *print.JekyllManager

func init() {
	jekyllManager = print.NewJekyllManager()
}

func jeckylRepoServer(c *Context) error {
	var err error
	client := Client(c.W, c.R)
	if nil == client {
		// GithubClient will have redirected us
		return nil
	}

	username := client.Username
	repoUser := c.Vars[`repoUser`]
	repoName := c.Vars[`repoName`]

	glog.Infof(`Got jeckyl request for %s/%s/%s on path %s`,
		username, repoUser, repoName, c.Vars[`path`])

	// Ok, so now we've got a path on the Jekyll server
	// we want to serve

	j, err := jekyllManager.GetJekyll(client.Username, repoUser, repoName)
	if nil != err {
		return err
	}
	j.ServeHTTP(c.W, c.R)
	return nil
}
