package git

import (
	"fmt"
	"os"
	"path/filepath"
	"time"

	"github.com/golang/glog"
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

// PullRequestCheckout checks out the given
// remoteUrl with given sha
func PullRequestCheckout(client *Client, remoteUrl, sha string) (string, error) {
	remoteUrl, err := client.AddAuth(remoteUrl)
	if nil != err {
		return ``, err
	}
	glog.Infof(`PullRequestCheckout(remote = %s, sha = %s)`, remoteUrl, sha)
	prRoot, err := PullRequestDir(``)
	os.MkdirAll(prRoot, 0755)
	prDir := filepath.Join(prRoot, sha)
	_, err = os.Stat(prDir)
	if nil == err {
		// Update from origin / master
		if err = runGitDir(prDir, []string{`pull`, `origin`, `master`}); nil != err {
			return ``, err
		}
	} else {
		if !os.IsNotExist(err) {
			return ``, util.Error(err)
		}
		glog.Infof("Going to clone %s", remoteUrl)
		if err = runGitDir(prRoot, []string{`clone`, remoteUrl, sha}); nil != err {
			return ``, err
		}
	}

	if err = gitConfig(client, prDir); nil != err {
		return ``, err
	}
	if err = runGitDir(prDir, []string{`checkout`, sha}); nil != err {
		return ``, err
	}
	return prDir, nil
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

// PullRequestCreate creates a new Pull Request from the user's repo to the
// upstream repo.
// In order to ensure that changes to the user's repo aren't propagated
// with the PR, we branch at the point of PR creation.
func PullRequestCreate(client *Client, user, repoOwner, repoName, title, notes string) error {
	head := fmt.Sprintf(`%s:master`, user)
	// head := `master`
	base := `master`

	upstream, _, err := client.Repositories.Get(client.Context, repoOwner, repoName)
	if nil != err {
		return err
	}
	upstreamUser := *upstream.Parent.Owner.Login
	upstreamRepo := *upstream.Parent.Name

	glog.Infof(`Creating new PR: title=%s, Head=%s, Base=%s, Body=%s, User=%s, Repo=%s`,
		title, head, base, notes, upstreamUser, upstreamRepo)
	_, _, err = client.PullRequests.Create(client.Context,
		upstreamUser, upstreamRepo,
		&github.NewPullRequest{
			Title: &title,
			Head:  &head,
			Base:  &base,
			// Body:  &notes,
		})
	if nil != err {
		return util.Error(err)
	}
	// _, _, err := client.PullRequests.CreateComment(user,
	// 	repo, prNumber, &github.PullRequestComment{
	// 		Comment: &notes,
	// 	})
	return nil
}

func GithubCreatePullRequest(
	client *Client,
	workingDir string,
	remote string,
	upstreamBranch string,
	title, notes string) error {
	var err error
	if `` == workingDir {
		workingDir, err = os.Getwd()
		if nil != err {
			return util.Error(err)
		}
	}

	localBranch, err := GitCurrentBranch(client, workingDir)
	if nil != err {
		return util.Error(err)
	}

	sourceHead := fmt.Sprintf(`%s:%s`, client.Username, localBranch)

	// remote will default to 'origin'
	_, remoteRepo, err := GitRemoteRepo(workingDir, remote)

	upstream, _, err := client.Repositories.Get(client.Context,
		client.Username, remoteRepo)
	if nil != err {
		return err
	}
	upstreamUser := *upstream.Parent.Owner.Login
	upstreamRepo := *upstream.Parent.Name

	glog.Infof(`Creating new PR: title=%s, Head=%s, Base=%s, Body=%s, User=%s, Repo=%s`,
		title, sourceHead, upstreamBranch, notes, upstreamUser, upstreamRepo)
	pr, _, err := client.PullRequests.Create(client.Context,
		upstreamUser, upstreamRepo,
		&github.NewPullRequest{
			Title: &title,
			Head:  &sourceHead,
			Base:  &upstreamBranch,
			Body:  &notes,
		})
	if nil != err {
		return util.Error(err)
	}
	fmt.Printf("Created PR %d on %s/%s\n", *pr.Number, upstreamUser, upstreamRepo)
	return nil
}
