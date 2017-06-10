package www

import (
	"fmt"
	// "github.com/golang/glog"
	// "ebw/git"
)

func repoConflict(c *Context) error {
	repo, err := c.Repo()
	if nil != err {
		return err
	}
	stagedFiles, err := repo.StagedFilesAbbreviated()
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
	// FOR CONFLICT RESOLVE, I JUST NEED TO EXECUTE
	// git commit -am 'merged' && git push origin master ... ?
	// if push origin master fails, I might need to git pull origin master
	// and then resolve the new conflicts that arise.
	return fmt.Errorf("repo-confict-resolve is not yet implemented")
}
