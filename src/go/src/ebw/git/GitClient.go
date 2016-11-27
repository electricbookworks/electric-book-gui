package git

import (
	"errors"
	"net/http"

	// "github.com/golang/glog"
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
	if nil == cookie {
		return nil, ErrNotLoggedIn
	}
	if nil != err {
		return nil, util.Error(err)
	}
	ts := oauth2.StaticTokenSource(
		&oauth2.Token{AccessToken: cookie.Value},
	)
	tc := oauth2.NewClient(oauth2.NoContext, ts)

	// // Because a cookie can be expired, we quickly check whether
	// // it is working
	client := github.NewClient(tc)
	// if _, _, err = client.Zen(); nil != err {
	// 	glog.Errorf("Zen() failed: %s", err.Error())
	// 	return nil, ErrNotLoggedIn
	// }
	return client, nil
}
