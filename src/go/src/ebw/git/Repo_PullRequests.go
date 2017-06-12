package git

import (
	"fmt"

	// "github.com/golang/glog"
	"github.com/google/go-github/github"
	git2go "gopkg.in/libgit2/git2go.v25"

	"ebw/util"
)

// PullRequest returns the pull request with the given number for the repo.
func (r *Repo) PullRequest(number int) (*github.PullRequest, error) {
	pr, _, err := r.Client.Client.PullRequests.Get(r.Client.Context, r.RepoOwner, r.RepoName, number)
	if nil != err {
		return nil, util.Error(err)
	}
	return pr, nil
}

// PullRequestList returns a list of the PullRequests for this repo.
func (r *Repo) PullRequestList() ([]*PullRequest, error) {
	prs, _, err := r.Client.Client.PullRequests.List(r.Client.Context, r.RepoOwner, r.RepoName,
		&github.PullRequestListOptions{
			ListOptions: github.ListOptions{
				Page:    0,
				PerPage: 5000,
			},
		})
	if nil != err {
		return nil, util.Error(err)
	}
	res := make([]*PullRequest, len(prs))
	for i, pr := range prs {
		res[i] = &PullRequest{pr}
	}
	return res, nil
}

// PullRequestFetch fetches the numbered pull request so that it can be
// merged with the current repo.
func (r *Repo) PullRequestFetch(number int) error {
	pr, err := r.PullRequest(number)
	if nil != err {
		return err
	}
	remoteName := fmt.Sprintf(`_pull_request_%d`, number)
	if err := r.AddRemote(remoteName, pr.Head.Repo.GetCloneURL()); nil != err {
		return err
	}
	if err := r.FetchRemote(remoteName); nil != err {
		return err
	}
	return nil
}

// PullRequestMerge merges the PR with the given number
// with the HEAD of the current repo.
func (r *Repo) PullRequestMerge(number int) error {
	pr, err := r.PullRequest(number)
	if nil != err {
		return err
	}

	prId, err := git2go.NewOid(pr.Head.GetSHA())
	if nil != err {
		return util.Error(err)
	}
	prCommit, err := r.Repository.LookupAnnotatedCommit(prId)
	if nil != err {
		return util.Error(err)
	}
	defer prCommit.Free()
	return r.mergeAnnotatedCommit(prCommit)
}
