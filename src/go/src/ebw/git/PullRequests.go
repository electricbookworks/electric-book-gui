package git

import (
	"os"
	"path/filepath"
	"time"

	"github.com/google/go-github/github"

	"ebw/config"
	"ebw/util"
)

// ListPullRequests returns a list of the Pull Requests for the
// given repoOwner/repoName
func ListPullRequests(client *Client, repoOwner, repoName string) ([]*github.PullRequest, error) {
	opts := &github.PullRequestListOptions{}
	requests := []*github.PullRequest{}
	if err := GithubPaginate(&opts.ListOptions, func() (*github.Response, error) {
		r, res, err := client.PullRequests.List(client.Context,
			repoOwner, repoName, opts)
		if nil != err {
			return nil, util.Error(err)
		}
		requests = append(requests, r...)
		return res, err
	}); nil != err {
		return nil, err
	}
	return requests, nil
}

func GetPullRequest(client *Client, user, repoOwner, repoName string, number int) (*github.PullRequest, error) {
	pr, _, err := client.PullRequests.Get(client.Context, repoOwner, repoName, number)
	return pr, err
}

// PullRequestDir returns the local git_cache location for the given pull request, or
// if sha is an empty string, the root directory for all prrequest checkouts
func PullRequestDir(sha string) (string, error) {
	root, err := os.Getwd()
	if nil != err {
		return ``, util.Error(err)
	}
	prRoot := filepath.Join(root, config.Config.GitCache, `pr_requests`)
	if `` == sha {
		return prRoot, nil
	}
	return filepath.Join(prRoot, sha), nil
}

func PullRequestDiffListByNumber(client *Client, repoOwner, repoName string,
	prNumber int) ([]*PullRequestDiff, error) {
	pr, _, err := client.PullRequests.Get(client.Context, repoOwner, repoName, prNumber)
	if nil != err {
		return nil, util.Error(err)
	}
	return PullRequestDiffList(client, repoOwner, repoName, pr)
}

func PullRequestDiffList(client *Client, repoOwner, repoName string,
	pr *github.PullRequest) ([]*PullRequestDiff, error) {
	localPath, err := RepoDir(client.Username, repoOwner, repoName)
	if nil != err {
		return nil, err
	}
	remotePath, err := PullRequestDir(pr.Head.GetSHA())
	if nil != err {
		return nil, err
	}
	files := []*github.CommitFile{}
	opts := &github.ListOptions{}
	if err := GithubPaginate(opts, func() (*github.Response, error) {
		f, res, err := client.PullRequests.ListFiles(client.Context,
			repoOwner, repoName, pr.GetNumber(), opts)
		if nil != err {
			return nil, util.Error(err)
		}
		files = append(files, f...)
		return res, err
	}); nil != err {
		return nil, err
	}

	diffs := make([]*PullRequestDiff, len(files))
	for i, p := range files {
		diffs[i], err = GetPathDiff(localPath, remotePath, p.GetFilename())
		if nil != err {
			return nil, err
		}
	}
	return diffs, err
}

// PullRequestUpdate just updates the file in the 'master' repo the
// same as editing in the regular system.
func PullRequestUpdate(client *Client, user, repoOwner, repoName string,
	sha string, path string, content []byte) error {
	return UpdateFile(client, user, repoOwner, repoName, path, content)
}

func PullRequestClose(client *Client, repoOwner, repoName string, number int) error {
	closedAt := time.Now()
	merged := true
	state := `closed`
	_, _, err := client.PullRequests.Edit(client.Context, repoOwner, repoName, number, &github.PullRequest{
		Number:   &number,
		ClosedAt: &closedAt,
		Merged:   &merged,
		State:    &state,
	})
	if nil != err {
		return util.Error(err)
	}
	return nil
}
