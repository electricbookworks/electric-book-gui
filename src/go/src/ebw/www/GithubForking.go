package www

import (
	"fmt"
	"strings"
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
	parts := strings.Split(repoUserAndName, `/`)
	if 2 != len(parts) {
		return fmt.Errorf(`Expected repo format of USERNAME/REPONAME, but got %d parts instead`, len(parts))
	}
	repoUser, repoName := parts[0], parts[1]

	redirectUrl, err := pathRepoEdit(c, repoUser, repoName)
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
	// panic(`githubCreateNew`)
	client := Client(c.W, c.R)
	if nil == client {
		// GithubClient will have redirected us
		return nil
	}

	/* These fields are defined in public/es6/AddNewBookDialog.html */
	repoNewName := c.P(`repo_new`)
	repoOwner := c.P(`org_name`)
	if `` == repoOwner {
		repoOwner = c.Client.Username
	}

	redirectUrl, err := pathRepoEdit(c, repoOwner, repoNewName)
	if nil != err {
		/** @TODO Provide a more useful error explaining that the
		 * user/repo format is required to make a repo fork.
		 */
		return err
	}

	if err := git.DuplicateRepo(client, client.Token,
		`electricbookworks/electric-book`, c.P(`org_name`), repoNewName); nil != err {
		return err
	}

	return c.Redirect(redirectUrl)
}
