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

	// only show conflicted files if we're not merging a PR
	stagedFiles, err := repo.MergingFilesList(0 == repo.EBWRepoStatus.MergingPRNumber)
	if nil != err {
		return err
	}

	return c.Render(`repo_conflict.html`, map[string]interface{}{
		`Repo`:        repo,
		`RepoOwner`:   repo.RepoOwner,
		`RepoName`:    repo.RepoName,
		`UserName`:    c.Client.Username,
		`StagedFiles`: stagedFiles,
		`Merging`:     repo.EBWRepoStatus,
	})
}

// repoConflictAbort aborts the pull that caused a conflict on a repo,
// and returns the user to the repo detail page.
func repoConflictAbort(c *Context) error {
	var args struct {
		ClosePR   bool   `schema:"close"`
		PRMessage string `schema:"message"`
	}
	if err := c.Decode(&args); nil != err {
		return err
	}
	repo, err := c.Repo()
	if nil != err {
		return err
	}
	// We need to get the PRNumber before we call PullAbort, because
	// that will clear the PRNumber from the EBWStatus
	prNumber := repo.EBWRepoStatus.MergingPRNumber

	if err := repo.PullAbort(); nil != err {
		return err
	}

	if args.ClosePR {
		if 0 == prNumber {
			// THIS SHOULDN'T HAPPEN, because we shouldn't ask the user
			// to close a PR if there isn't a PR
			return fmt.Errorf(`We received a request to close a PR, but we weren't editing a PR.`)
		}
		// This is RepoConflict ABORT, so the 'merged' flag must be false to
		// PullRequestClose, because we have not merged the PR with our codebase.
		if err := repo.PullRequestClose(prNumber, false); nil != err {
			return err
		}
	}
	return c.Redirect(pathRepoDetail(repo))
}

// repoConflictResolve is called when a repo conflict has been resolved to the
// user's satisfaction
func repoConflictResolve(c *Context) error {
	var r struct {
		Notes   string `schema:"notes"`
		Message string `schema:"message"`
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
	prNumber := repo.EBWRepoStatus.MergingPRNumber

	if err := repo.CloseConflict(r.Message, r.Notes); nil != err {
		return err
	}
	// If we were merging a PR, we need to close the PR and indicate that the
	// merge has succeeded
	if 0 < prNumber {
		if err := repo.PullRequestClose(prNumber, true); nil != err {
			return fmt.Errorf(`ERROR on PullRequestClose(%d, true, %s): %s`, prNumber, r.Message, err.Error())
		}
	}
	glog.Infof(`Resolved conflict, going back to detail %s`, pathRepoDetail(repo))
	return c.Redirect(pathRepoDetail(repo))
}
