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
func GithubClientFromWebRequest(w http.ResponseWriter, r *http.Request) (*github.Client, error) {
	token, err := GithubTokenFromWebRequest(r)
	if nil != err {
		return nil, err
	}

	ts := oauth2.StaticTokenSource(
		&oauth2.Token{AccessToken: token},
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

// GithubTokenFromWebRequest returns the github token set with the token.
func GithubTokenFromWebRequest(r *http.Request) (string, error) {
	cookie, err := r.Cookie(GithubTokenCookie)
	if nil == cookie || `` == cookie.Value {
		return ``, ErrNotLoggedIn
	}
	if nil != err {
		return ``, util.Error(err)
	}
	return cookie.Value, nil
}
