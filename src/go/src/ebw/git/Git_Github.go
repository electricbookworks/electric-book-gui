package git

import (
	"fmt"
	"net/url"
	"strings"
	"time"

	"github.com/google/go-github/github"
	"golang.org/x/oauth2"
	// git2go "gopkg.in/libgit2/git2go.v25"
)

type GithubRemote struct {
	Owner string
	Repo  string
}

var ErrRemoteIsNotGithub = fmt.Errorf("Remote is not a github remote")

// GithubRemote returns
func (g *Git) GithubRemote(remoteName string) (*GithubRemote, error) {
	r, err := g.Repository.Remotes.Lookup(remoteName)
	if nil != err {
		return nil, g.Error(err)
	}
	defer r.Free()
	u, err := url.Parse(r.Url())
	if nil != err {
		return nil, g.Error(err)
	}
	parts := strings.Split(u.Hostname(), ".")
	lp := len(parts)
	if parts[lp-2] != `github` {
		return nil, ErrRemoteIsNotGithub
	}
	parts = strings.Split(u.Path, "/")
	if 2 > len(parts) {
		return nil, fmt.Errorf("Failed to parse github owner-repo from path ", u.Path)
	}
	gr := &GithubRemote{
		Owner: parts[1],
		Repo:  parts[2],
	}
	if strings.HasSuffix(gr.Repo, `.git`) {
		gr.Repo = gr.Repo[0 : len(gr.Repo)-4]
	}
	return gr, nil
}

// GitubClient returns a github.Client configured with the
// password for the `origin` remote of this git repo. It ONLY uses the
// password, hence it requires the password to be a github TOKEN. If the
// password is not a token, the github client it returns will not work.
func (g *Git) GithubClient() (*github.Client, error) {
	_, token, err := g.RemoteUser(`origin`)
	if nil != err {
		return nil, err
	}
	tc := oauth2.NewClient(oauth2.NoContext, oauth2.StaticTokenSource(
		&oauth2.Token{AccessToken: token},
	))

	return github.NewClient(tc), nil
}

// GithubClosePullRequest closes the currently open pull-request
// on github.
func (g *Git) GithubClosePullRequest(merged bool) error {
	prNumber, err := g.MergingPRNumber()
	if nil != err {
		return err
	}
	if 0 == prNumber {
		return fmt.Errorf(`No pull request merge in progress - cannot call GithubClosePullRequest`)
	}
	githubRemote, err := g.GithubRemote(`origin`)
	if nil != err {
		return err
	}

	closedAt := time.Now()
	state := `closed`
	client, err := g.GithubClient()
	if nil != err {
		return err
	}
	if _, _, err := client.PullRequests.Edit(g.Context, githubRemote.Owner, githubRemote.Repo,
		prNumber,
		&github.PullRequest{
			Number:   &prNumber,
			ClosedAt: &closedAt,
			Merged:   &merged,
			State:    &state,
		}); nil != err {
		return g.Error(err)
	}
	return nil
}
