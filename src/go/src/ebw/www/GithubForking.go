package www

import (
	// "strings"

	"github.com/golang/glog"
	// "github.com/google/go-github/github"

	"ebw/git"
)

var _ = glog.Infof

// githubCreateFork forks an existing repo
func githubCreateFork(c *Context) error {
	client := Client(c.W, c.R)
	if nil == client {
		// GithubClient will have redirected us
		return nil
	}

	/* These fields are defined in public/es6/AddNewBookDialog.html */
	repoUserAndName := c.P(`collaborate_repo`)
	redirectUrl, err := pathRepoEdit(c, repoUserAndName)
	if nil != err {
		/** @TODO Provide a more useful error explaining that the
		 * user/repo format is required to make a repo fork.
		 */
		return err
	}

	if err := git.ContributeToRepo(client, repoUserAndName); nil != err {
		return err
	}

	return c.Redirect(redirectUrl)
}

// githubCreateNew creates a New book - ie a duplication of the
// base electric-book template.
func githubCreateNew(c *Context) error {
	client := Client(c.W, c.R)
	if nil == client {
		// GithubClient will have redirected us
		return nil
	}

	/* These fields are defined in public/es6/AddNewBookDialog.html */
	repoNewName := c.P(`repo_new`)

	redirectUrl, err := pathRepoEdit(c, c.Client.Username+"/"+repoNewName)
	if nil != err {
		/** @TODO Provide a more useful error explaining that the
		 * user/repo format is required to make a repo fork.
		 */
		return err
	}

	if err := git.DuplicateRepo(client, client.Token,
		`electricbookworks/electric-book`, repoNewName); nil != err {
		return err
	}

	return c.Redirect(redirectUrl)
}
