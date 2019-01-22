package www

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/golang/glog"

	cliConfig "ebw/cli/config"
	"ebw/config"
	"ebw/git"
	"ebw/util"
	"github.com/google/go-github/github"
	"golang.org/x/oauth2"
	"regexp"
)

type githubToken struct {
	AccessToken string `json:"access_token"`
	TokenType   string `json:"token_type"`
	Scope       string `json:"scope"`
}

// githubLogin forwards the user to login on Github
func githubLogin(c *Context) error {
	err := cliConfig.ReadConfigFile(filepath.Join(os.Getenv("HOME"), ".ebw.yml"))
	if nil != err {
		glog.Info(err)
	}
	if nil == err {
		glog.Infof(`Setting c.D['Users']`)
		c.D[`Users`] = cliConfig.Config.Users
	}

	p := url.Values{}
	p.Add(`client_id`, config.Config.Github.Client)
	p.Add(`redirect_uri`, config.Config.Server+"/github/auth")
	p.Add(`scope`, `repo user user:email user:name`)
	state := util.RandomString(20)
	c.Session.Values[`github_state`] = state
	p.Add(`state`, state)
	glog.Infof(`About to render landing.html`)

	return c.Render("landing.html", map[string]interface{}{
		"AuthURL":              `https://github.com/login/oauth/authorize?` + p.Encode(),
		"ConfigAllowAutoLogin": config.Config.AllowAutoLogin,
	})
}

// githubAuth receives github's oauth2 authorization response
func githubAuth(c *Context) error {
	glog.Infof(`githubAuth callback: form values = %v`, c.R.Form)
	p := url.Values{}
	if "" != c.R.FormValue("error") {
		return fmt.Errorf(`We were unable to authenticate you on GitHub: %s`, c.R.FormValue("error_description"))
	}
	state, ok := c.Session.Values[`github_state`].(string)
	if !ok {
		return fmt.Errorf(`We're sorry, something went wrong with the login - we lost track of your state. Please try again.`)
	}
	glog.Infof("Callback from github with auth code: %s", c.R.FormValue("code"))
	p.Add(`code`, c.R.FormValue(`code`))
	p.Add(`client_id`, config.Config.Github.Client)
	p.Add(`client_secret`, config.Config.Github.Secret)
	p.Add(`redirect_uri`, config.Config.Server+`/github/auth`)
	p.Add(`state`, state)
	if state != c.R.FormValue(`state`) {
		return fmt.Errorf(`We're sorry, something went wrong with the login. It looks like you didn't come from the authorization page we sent you to. Please try again.`)
	}
	delete(c.Session.Values, `github_state`)

	req, err := http.NewRequest("POST", `https://github.com/login/oauth/access_token`,
		strings.NewReader(p.Encode()))
	req.Header.Add("Accept", "application/json")
	if nil != err {
		return err
	}
	var client http.Client
	res, err := client.Do(req)
	if nil != err {
		return err
	}

	defer res.Body.Close()
	token := &githubToken{}
	if err := json.NewDecoder(res.Body).Decode(&token); nil != err {
		return err
	}

	// HERE WE SET THE ACCESS COOKIE - WHICH MEANS THE
	// USER IS LOGGED ON...
	// SO, RATHER:
	loginUser := func() error {
		http.SetCookie(c.W, &http.Cookie{
			Name:  git.GithubTokenCookie,
			Value: token.AccessToken,
			Path:  "/",
		})
		return c.Redirect(`/`)
	}

	ts := oauth2.StaticTokenSource(
		&oauth2.Token{AccessToken: token.AccessToken},
	)
	tc := oauth2.NewClient(oauth2.NoContext, ts)
	gc := github.NewClient(tc)

	user, _, err := gc.Users.Get(c.Context(), "")

	glog.Infof(`GitHub Logged in %s:%s`, user.GetLogin(), token.AccessToken)

	for _, username := range config.Config.AllowedUsers {
		r := regexp.MustCompile(username)
		if r.MatchString(user.GetLogin()) {
			return loginUser()
		}
	}
	glog.Infof(`Rejecting %s against list %v`, user.GetLogin(), config.Config.AllowedUsers)
	c.FlashError(`Not Permitted`,
		`Sorry, but `+user.GetLogin()+` is not permitted to access this system`,
		map[string]interface{}{})

	return c.Redirect(`/`)
}

func githubSetToken(c *Context) error {
	strToken := c.Vars[`token`]
	http.SetCookie(c.W, &http.Cookie{
		Name:  git.GithubTokenCookie,
		Value: strToken,
		Path:  `/`,
	})
	return c.Redirect(`/`)
}

func LogoffHandler(c *Context) error {
	http.SetCookie(c.W, &http.Cookie{
		Name:    git.GithubTokenCookie,
		Value:   ``,
		Path:    `/`,
		Expires: time.Time{},
	})

	c.Redirect(`/`)
	return nil
}

func ToGithubHandler(c *Context) error {
	return c.Redirect(`https://github.com/%s`, c.P(`u`))
}

func Client(w http.ResponseWriter, r *http.Request) *git.Client {
	client, err := git.ClientFromWebRequest(w, r)
	if err == git.ErrNotLoggedIn {
		http.Redirect(w, r, "/github/login", http.StatusFound)
		return nil
	}
	if nil != err {
		WebError(w, r, err)
		return nil
	}
	return client
}
