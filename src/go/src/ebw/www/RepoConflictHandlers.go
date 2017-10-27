package www

import (
	"fmt"

	"github.com/golang/glog"
)

var _ = glog.Infof

func repoConflict(c *Context) error {
	repo, err := c.Repo()
	if nil != err {
		return err
	}

	// only show conflicted files if we're not merging a PR
	mergingFiles, err := repo.MergingFilesList()
	if nil != err {
		return err
	}
	// No files are currently merging... this _can only happen_ if
	// we're not in a conflict state
	if 0 == len(mergingFiles) {
		if !repo.Git.IsMerging() {
			return c.Redirect(pathRepoDetail(repo))
		}
		return fmt.Errorf(`repo is MERGING, but has no marked merging files`)
	}

	return c.Render(`repo_conflict.html`, map[string]interface{}{
		`Repo`:        repo,
		`RepoOwner`:   repo.RepoOwner,
		`RepoName`:    repo.RepoName,
		`UserName`:    c.Client.Username,
		`StagedFiles`: mergingFiles,
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

	if err := repo.PullAbort(args.ClosePR); nil != err {
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

	if err := repo.CloseConflict(r.Message, r.Notes); nil != err {
		return err
	}

	return c.Redirect(pathRepoDetail(repo))
}
