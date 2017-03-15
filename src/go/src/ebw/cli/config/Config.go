package config

import (
	"errors"
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"

	"github.com/google/go-github/github"
	"golang.org/x/oauth2"
	"gopkg.in/yaml.v2"
)

type githubUser struct {
	Name  string `yaml:"name"`
	Token string `yaml:"token"`
}

type conf struct {
	Users       []*githubUser `yaml:"users"`
	DefaultUser string        `yaml:"defaultUser"`
}

var Config conf

// ReadConfigFile reads the configuration file
func ReadConfigFile(in string) error {
	return Config.readFile(in)
}

// GetUser returns the currently configured user based on the
// configuration settings.
func (c *conf) GetUser() (*githubUser, error) {
	if 0 == len(c.Users) {
		return nil, errors.New("No users defined")
	}
	if "" == c.DefaultUser {
		return c.Users[0], nil
	}
	for _, u := range c.Users {
		if u.Name == c.DefaultUser {
			return u, nil
		}
	}
	return nil, fmt.Errorf("Failed to find defaultUser '%s'", c.DefaultUser)
}

// SetUser sets the default user for this session.
func (c *conf) SetUser(user string) error {
	for _, u := range c.Users {
		if u.Name == user {
			c.DefaultUser = user
			return nil
		}
	}
	return fmt.Errorf("Failed to set default Config user to '%s': no such user found", user)
}

// GithubClient returns a github.Client for the currently configured
// user.
func (c *conf) GithubClient() (*github.Client, error) {
	user, err := c.GetUser()
	if nil != err {
		return nil, err
	}
	ts := oauth2.StaticTokenSource(
		&oauth2.Token{AccessToken: user.Token},
	)
	tc := oauth2.NewClient(oauth2.NoContext, ts)

	client := github.NewClient(tc)
	// // Because a cookie can be expired, we quickly check whether
	// // it is working
	// if _, _, err = client.Zen(); nil != err {
	// 	glog.Errorf("Zen() failed: %s", err.Error())
	// 	return nil, ErrNotLoggedIn
	// }
	return client, nil
}

func (c *conf) readFile(in string) error {
	if "" == in {
		in = filepath.Join(os.Getenv("HOME"), ".ebw.yml")
	}
	raw, err := ioutil.ReadFile(in)
	if nil != err {
		return err
	}
	return yaml.Unmarshal(raw, c)
}
