package git

import (
	"context"
	"errors"
	"net/http"

	"github.com/golang/glog"
	"github.com/google/go-github/github"
	"golang.org/x/oauth2"

	"ebw/cli/config"
	"ebw/util"
)

type Client struct {
	*github.Client
	Username string
	Token    string
	Context  context.Context
}

const GithubTokenCookie = "github_token_cookie"

var ErrNotLoggedIn = errors.New(`No github token cookie found`)

// ClientFromWebRequest returns a client for Github communcations from the given
// web request.
func ClientFromWebRequest(w http.ResponseWriter, r *http.Request) (*Client, error) {
	token, err := GithubTokenFromWebRequest(r)
	if nil != err {
		return nil, err
	}
	glog.Infof("TOKEN = %s", token)

	ts := oauth2.StaticTokenSource(
		&oauth2.Token{AccessToken: token},
	)
	tc := oauth2.NewClient(oauth2.NoContext, ts)

	// // Because a cookie can be expired, we quickly check whether
	// // it is working
	client := github.NewClient(tc)
	user, _, err := client.Users.Get(r.Context(), "")
	if nil != err {
		return nil, err
	}
	// if _, _, err = client.Zen(); nil != err {
	// 	glog.Errorf("Zen() failed: %s", err.Error())
	// 	return nil, ErrNotLoggedIn
	// }
	return &Client{
		client,
		user.GetLogin(),
		token,
		r.Context(),
	}, nil
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

// ClientFromConfig returns the client based on the configuration
func ClientFromCLIConfig() (*Client, error) {
	c := config.Config
	user, err := c.GetUser()
	if nil != err {
		return nil, err
	}
	ts := oauth2.StaticTokenSource(
		&oauth2.Token{AccessToken: user.Token},
	)
	tc := oauth2.NewClient(oauth2.NoContext, ts)

	client := &Client{
		github.NewClient(tc),
		``,
		user.Token,
		context.Background(),
	}
	client.Username, err = Username(client)
	if nil != err {
		return nil, err
	}
	return client, nil
}
