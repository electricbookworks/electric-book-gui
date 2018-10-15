package git

import (
	"context"
	"errors"
	"net/http"
	"net/url"

	"github.com/golang/glog"
	"github.com/google/go-github/github"
	"golang.org/x/oauth2"

	"ebw/cli/config"
	"ebw/util"
)

var _ = glog.Info

type Client struct {
	*github.Client
	Username string
	Token    string
	Context  context.Context
	User     *github.User
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
	// glog.Infof("TOKEN = %s", token)

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
		user,
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

// ClientFromCLIConfigNamed returns the client for the named user from the
// cli config.
func ClientFromCLIConfigNamed(name string) (*Client, error) {
	c := config.Config
	user, err := c.GetUserNamed(name)
	if nil != err {
		return nil, err
	}
	ts := oauth2.StaticTokenSource(
		&oauth2.Token{AccessToken: user.Token},
	)
	tc := oauth2.NewClient(oauth2.NoContext, ts)

	githubClient := github.NewClient(tc)
	ctxt := context.Background()
	githubUser, _, err := githubClient.Users.Get(ctxt, "")
	if nil != err {
		return nil, err
	}

	client := &Client{
		Client:   githubClient,
		Username: ``,
		Token:    user.Token,
		Context:  ctxt,
		User:     githubUser,
	}
	client.Username, err = Username(client)
	if nil != err {
		return nil, err
	}
	return client, nil
}

// ClientFromCLIConfigAlias returns the client for the user with the given
// alias from the
// cli config.
func ClientFromCLIConfigAlias(name string) (*Client, error) {
	c := config.Config
	user, err := c.GetUserAlias(name)
	if nil != err {
		return nil, err
	}
	ts := oauth2.StaticTokenSource(
		&oauth2.Token{AccessToken: user.Token},
	)
	tc := oauth2.NewClient(oauth2.NoContext, ts)

	githubClient := github.NewClient(tc)
	ctxt := context.Background()
	githubUser, _, err := githubClient.Users.Get(ctxt, "")
	if nil != err {
		return nil, err
	}

	client := &Client{
		Client:   githubClient,
		Username: ``,
		Token:    user.Token,
		Context:  ctxt,
		User:     githubUser,
	}
	client.Username, err = Username(client)
	if nil != err {
		return nil, err
	}
	return client, nil
}

type basicAuthRoundtripper struct {
	client   http.Client
	username string
	password string
	parent   http.RoundTripper
}

func (b *basicAuthRoundtripper) RoundTrip(req *http.Request) (*http.Response, error) {
	req.SetBasicAuth(b.username, b.password)
	if nil != b.parent {
		return b.parent.RoundTrip(req)
	}
	return b.client.Do(req)
}

// ClientFromUsernamePassword returns a new GitHub client from the
// given username-password combination, or from CLI config if both
// are empty strings.
func ClientFromUsernamePassword(username, password string) (*Client, error) {
	if `` == username && `` == password {
		return ClientFromCLIConfig()
	}
	authClient := http.Client{}
	authClient.Transport = &basicAuthRoundtripper{
		username: username,
		password: password,
		parent:   authClient.Transport}
	githubClient := github.NewClient(&authClient)
	ctxt := context.Background()
	githubUser, _, err := githubClient.Users.Get(ctxt, "")
	if nil != err {
		return nil, err
	}

	client := &Client{
		Client:   githubClient,
		Username: ``,
		Token:    password,
		Context:  ctxt,
		User:     githubUser,
	}
	client.Username, err = Username(client)
	if nil != err {
		return nil, err
	}
	return client, nil
}

// ClientFromConfig returns the client based on the configuration
func ClientFromCLIConfig() (*Client, error) {
	c := config.Config
	user, err := c.GetUser()
	if nil != err {
		glog.Infof("ERROR on c.GetUser: %s", err.Error())
		return nil, err
	}
	ts := oauth2.StaticTokenSource(
		&oauth2.Token{AccessToken: user.Token},
	)
	tc := oauth2.NewClient(oauth2.NoContext, ts)

	githubClient := github.NewClient(tc)
	ctxt := context.Background()
	githubUser, _, err := githubClient.Users.Get(ctxt, "")
	if nil != err {
		glog.Errorf("Error with token %s for user %s: %s", user.Token, user.Name, err.Error())
		return nil, err
	}

	client := &Client{
		Client:   githubClient,
		Username: ``,
		Token:    user.Token,
		Context:  ctxt,
		User:     githubUser,
	}
	client.Username, err = Username(client)
	if nil != err {
		return nil, err
	}
	return client, nil
}

// AddAuth adds username and password authentication to the
// origUrl from the client credentials.
func (c *Client) AddAuth(origUrl string) (string, error) {
	u, err := url.Parse(origUrl)
	if nil != err {
		return ``, util.Error(err)
	}
	if nil == u.User || `` == u.User.Username() {
		u.User = url.UserPassword(c.Username, c.Token)
	}
	return u.String(), nil
}
