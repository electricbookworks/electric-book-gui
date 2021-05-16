package git

import (
	"fmt"
	"net/url"
	"strings"
	"time"

	"github.com/google/go-github/github"
	"golang.org/x/oauth2"
	// git2go "github.com/craigmj/git2go/v31"
)

type GithubRemote struct {
	Owner string
	Repo  string
}

var ErrRemoteIsNotGithub = fmt.Errorf("Remote is not a github remote")

// GithubCanSubmitPR returns true if this repo has a github parent - an
// upstream repo - and the current repo differs from the upstream
// remote at the last point that the upstream remote was merged.
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

// GithubClient returns a github.Client configured with the
// password for the `origin` remote of this git repo. It ONLY uses the
// password, hence it requires the password to be a github TOKEN. If the
// password is not a token, the github client it returns will not work.
func (g *Git) GithubClient() (*github.Client, error) {
	if nil != g.github {
		return g.github, nil
	}
	_, token, err := g.RemoteUser(`origin`)
	if nil != err {
		return nil, err
	}
	tc := oauth2.NewClient(oauth2.NoContext, oauth2.StaticTokenSource(
		&oauth2.Token{AccessToken: token},
	))

	g.github = github.NewClient(tc)
	return g.github, nil
}

// GithubUser returns the github user for this repo
func (g *Git) GithubUser() (*github.User, error) {
	gc, err := g.GithubClient()
	if nil != err {
		return nil, err
	}
	u, _, err := gc.Users.Get(g.Context, ``)
	if nil != err {
		return nil, g.Error(err)
	}
	return u, nil
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

// GithubRepo returns github.Repository for the github repo that this repo
// was cloned from.
func (g *Git) GithubRepo() (*github.Repository, error) {
	client, err := g.GithubClient()
	if nil != err {
		return nil, err
	}
	remote, err := g.GithubRemote(`origin`)
	if nil != err {
		return nil, err
	}
	if nil == g.Context {
		panic("g.Context is nil")
	}
	if nil == remote {
		panic(`remote is nil`)
	}
	if nil == client {
		panic(`client is nil`)
	}

	repo, _, err := client.Repositories.Get(g.Context,
		remote.Owner, remote.Repo)
	if nil != err {
		return nil, g.Error(err)
	}
	return repo, nil
}

// HasUpstreamRemote returns true if the repo has an upstream
// remote - ie a parent to the github repo
func (g *Git) HasUpstreamRemote() (bool, error) {
	if err := g.SetUpstreamRemote(); nil != err {
		if err == ErrNoGithubParent {
			return false, nil
		}
		return false, err
	}
	return true, nil
}

// GetUpstreamRemote returns the owner and repo-name for the repo's
// upstream remote.
func (g *Git) GetUpstreamRemote() (user string, name string, err error) {
	repo, err := g.GithubRepo()
	if nil != err {
		return ``, ``, err
	}
	if nil == repo.Parent {
		return ``, ``, ErrNoGithubParent
	}
	return repo.Parent.Owner.GetLogin(), repo.Parent.GetName(), nil
}

// SetUpstreamRemote sets the remote `upstream` for the repo.
func (g *Git) SetUpstreamRemote() error {
	repo, err := g.GithubRepo()
	if nil != err {
		return err
	}
	if nil == repo.Parent {
		return ErrNoGithubParent
	}
	upstreamUrl, err := g.AddAuth(`https://github.com/` +
		repo.Parent.Owner.GetLogin() + `/` + repo.Parent.GetName() + `.git`)
	if nil != err {
		return g.Error(err)
	}
	return g.AddRemote(`upstream`, upstreamUrl)
}

// AddAuth adds username and password authentication to the original
// url taken from the repo origin client credentials.
func (g *Git) AddAuth(origUrl string) (string, error) {
	u, err := url.Parse(origUrl)
	if nil != err {
		return ``, g.Error(err)
	}
	if nil == u.User || `` == u.User.Username() {
		user, pass, err := g.RemoteUser(`origin`)
		if nil != err {
			return ``, err
		}
		u.User = url.UserPassword(user, pass)
	}
	return u.String(), nil
}
