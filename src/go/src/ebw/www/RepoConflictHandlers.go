package www

import (
	"fmt"

	"github.com/golang/glog"
	// "ebw/git"
)

func repoConflict(c *Context) error {
	repo, err := c.Repo()
	if nil != err {
		return err
	}

	stagedFiles, err := repo.MergingFilesList()
	if nil != err {
		return err
	}

	return c.Render(`repo_conflict.html`, map[string]interface{}{
		`Repo`:        repo,
		`RepoOwner`:   repo.RepoOwner,
		`RepoName`:    repo.RepoName,
		`StagedFiles`: stagedFiles,
	})
}

// repoConflictAbort aborts the pull that caused a conflict on a repo, and returns
// the user to the repo detail page.
func repoConflictAbort(c *Context) error {
	repo, err := c.Repo()
	if nil != err {
		return err
	}
	if err := repo.PullAbort(); nil != err {
		return err
	}
	return c.Redirect(pathRepoDetail(repo))
}

func repoConflictResolve(c *Context) error {
	var r struct {
		Notes   string
		Message string
	}
	if err := c.Decode(&r); nil != err {
		return err
	}
	if `` == r.Message {
		return fmt.Errorf(`You need to supply a Message for a commit`)
	}
	repo, err := c.Repo()
	if nil != err {
		return err
	}
	if err := repo.CloseConflict(r.Message, r.Notes); nil != err {
		return err
	}
	glog.Infof(`Resolved conflict, going back to detail %s`, pathRepoDetail(repo))
	return c.Redirect(pathRepoDetail(repo))
}
