package git

import (
	"fmt"
	"time"

	"github.com/golang/glog"
	"github.com/google/go-github/github"
	// git2go "gopkg.in/libgit2/git2go.v25"

	"ebw/util"
)

// PullRequest returns the pull request with the given number for the repo.
func (r *Repo) PullRequest(number int) (*github.PullRequest, error) {
	pr, _, err := r.Client.Client.PullRequests.Get(r.Client.Context, r.RepoOwner, r.RepoName, number)
	if nil != err {
		return nil, r.Error(err)
	}
	return pr, nil
}

// PullRequestList returns a list of the PullRequests for this repo.
func (r *Repo) PullRequestList() ([]*github.PullRequest, error) {
	prs := []*github.PullRequest{}
	opts := &github.PullRequestListOptions{}
	if err := GithubPaginate(&opts.ListOptions, func() (*github.Response, error) {
		t, resp, err := r.Client.Client.PullRequests.List(
			r.Client.Context, r.RepoOwner, r.RepoName, opts)
		if nil != err {
			return nil, util.Error(err)
		}
		prs = append(prs, t...)
		return resp, err
	}); nil != err {
		return nil, err
	}
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
	// res := make([]*PullRequest, len(prs))
	// for i, pr := range prs {
	// 	res[i] = &PullRequest{pr}
	// }
	return prs, nil
}

// PullRequestRemoteName returns the remote name for this PR when we
// configure it in our repo
func PullRequestRemoteName(pr *github.PullRequest) string {
	return fmt.Sprintf(`_pull_request_%d`, pr.Number)
}

// PullRequestFetch fetches the numbered pull request so that it can be
// merged with the current repo. The pr can be supplied in the second
// parameter, on the off-chance that you've already fetched it: no point
// making two GitHub API calls.
func (r *Repo) PullRequestFetch(number int, pr *github.PullRequest) error {
	var err error
	if nil == pr {
		pr, err = r.PullRequest(number)
		if nil != err {
			return err
		}
	}
	remoteName := PullRequestRemoteName(pr)
	cloneUrl, err := r.Client.AddAuth(pr.Head.Repo.GetCloneURL())
	if nil != err {
		return err
	}
	if err := r.AddRemote(remoteName, cloneUrl); nil != err {
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
	// Fetch the PR into our repo as a remote
	if err = r.PullRequestFetch(number, pr); nil != err {
		return err
	}

	return r.Git.MergePullRequest(number, PullRequestRemoteName(pr), pr.Head.GetSHA())

	// // We've now got the PR from GitHub, so we need to pull the
	// // remote and the remote's relevant branch. We have the PR's
	// // SHA in our local repo because we're pulled the entire remote
	// prId, err := git2go.NewOid(pr.Head.GetSHA())
	// if nil != err {
	// 	return util.Error(err)
	// }
	// prCommit, err := r.Repository.LookupAnnotatedCommit(prId)
	// if nil != err {
	// 	return util.Error(err)
	// }
	// defer prCommit.Free()
	// if err := r.mergeAnnotatedCommit(prCommit); nil != err {
	// 	return err
	// }

	// return nil
}

// PullRequestClose closes the given PR, with the merged indication and the given
// message.
func (r *Repo) PullRequestClose(number int, merged bool) error {
	closedAt := time.Now()
	state := `closed`
	if _, _, err := r.Client.PullRequests.Edit(r.Client.Context, r.RepoOwner, r.RepoName, number, &github.PullRequest{
		Number:   &number,
		ClosedAt: &closedAt,
		Merged:   &merged,
		State:    &state,
	}); nil != err {
		return util.Error(err)
	}
	return nil
}

// GetUpstreamPullRequestsCount returns the number of PR's that the
// upstream github repo has.
func (r *Repo) GetUpstreamPullRequestsCount() (int, error) {
	upstream, err := r.GithubRepo()
	if nil != err {
		return 0, err
	}
	if nil == upstream.Parent {
		return 0, r.Error(fmt.Errorf(`No Upstream owner for repo %s/%s`, r.RepoOwner, r.RepoName))
	}
	upstreamOwner := *upstream.Parent.Owner.Login
	upstreamName := *upstream.Parent.Name

	open, err := r.getUpstreamPullRequestsMaxNumber(upstreamOwner, upstreamName, `open`)
	if nil != err {
		return 0, err
	}
	closed, err := r.getUpstreamPullRequestsMaxNumber(upstreamOwner, upstreamName, `closed`)
	if nil != err {
		return 0, err
	}
	if open < closed {
		return closed, nil
	}
	return open, nil
}

// getUpstreamPullRequestsMaxNumber returns the maximum pull request Number for the repo
func (r *Repo) getUpstreamPullRequestsMaxNumber(upstreamOwner, upstreamName, openOrClosed string) (int, error) {
	pr, _, err := r.Client.Client.PullRequests.List(r.Client.Context,
		upstreamOwner, upstreamName, &github.PullRequestListOptions{
			State: openOrClosed,
			Sort:  `created`,
			ListOptions: github.ListOptions{
				Page:    1,
				PerPage: 1,
			},
		})
	if nil != err {
		return 0, r.Error(err)
	}
	if 0 == len(pr) {
		return 0, nil
	}
	return *pr[0].Number, nil
}

// PullRequestCreate creates a new Pull Request from the user's repo to the
// upstream repo.
// In order to ensure that changes to the user's repo aren't propagated
// with the PR, we branch at the point of PR creation.
func (r *Repo) PullRequestCreate(title, notes string) error {
	upstream, err := r.GithubRepo()

	if nil != err {
		return err
	}
	upstreamOwner := *upstream.Parent.Owner.Login
	upstreamName := *upstream.Parent.Name

	branchName, headOid, err := r.BranchCreate(``, false)
	if nil != err {
		return err
	}

	head := fmt.Sprintf(`%s:%s`, r.RepoOwner, branchName)
	base := `master`

	glog.Infof(`Creating new PR: title=%s, Head=%s, Base=%s, Body=%s, User=%s, Repo=%s`,
		title, head, base, notes, upstreamOwner, upstreamName)

	_, _, err = r.Client.PullRequests.Create(r.Client.Context,
		upstreamOwner, upstreamName,
		&github.NewPullRequest{
			Title: &title,
			Head:  &head,
			Base:  &base,
			// Body:  &notes,
		})
	if nil != err {
		return util.Error(err)
	}

	r.EBWRepoStatus.LastPRHash = headOid.String()
	if err := r.writeEBWRepoStatus(); nil != err {
		return err
	}

	return nil
}
