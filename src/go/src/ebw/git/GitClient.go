package git

import (
	"errors"
	"net/http"

	"github.com/google/go-github/github"
	"golang.org/x/oauth2"

	"ebw/util"
)

const GithubTokenCookie = "github_token_cookie"

var ErrNotLoggedIn = errors.New(`No github token cookie found`)

// GithubClient returns a client for Github communcations from the given
// web request.
func GithubClient(w http.ResponseWriter, r *http.Request) (*github.Client, error) {
	cookie, err := r.Cookie(GithubTokenCookie)
	if nil != err {
		return nil, util.Error(err)
	}
	if nil == cookie {
		return nil, ErrNotLoggedIn
	}
	ts := oauth2.StaticTokenSource(
		&oauth2.Token{AccessToken: cookie.Value},
	)
	tc := oauth2.NewClient(oauth2.NoContext, ts)

	return github.NewClient(tc), nil
}
