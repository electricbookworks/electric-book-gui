package config

import (
	"errors"
	"fmt"
	"io/ioutil"
	"net/url"
	"os"
	"path/filepath"

	"github.com/golang/glog"
	git2go "github.com/libgit2/git2go/v31"
	"gopkg.in/yaml.v2"

	"ebw/util"
)

type githubUser struct {
	Name  string `yaml:"name"`
	Alias string `yaml:"alias"`
	Token string `yaml:"token"`
}

type conf struct {
	Users         []*githubUser `yaml:"users"`
	DefaultUser   string        `yaml:"defaultUser"`
	UserSpecified bool          `yaml:"-"`
}

var Config conf
var ErrUnknownUser = fmt.Errorf(`Unknown user`)

// ReadConfigFile reads the configuration file
func ReadConfigFile(in string) error {
	return Config.readFile(in)
}

// GetUser returns the currently configured user based on the
// configuration settings.
func (c *conf) GetUser() (*githubUser, error) {
	if !c.UserSpecified {
		user, token, err := getUserForDir(``)
		if nil == err {
			glog.Infof(`GetUser found user for current directory: %s:%s`, user, token)
			return &githubUser{Name: user, Alias: user, Token: token}, nil
		}
	}

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

// GetUserNamed returns the githubUser with the given name.
func (c *conf) GetUserNamed(name string) (*githubUser, error) {
	for _, u := range c.Users {
		if u.Name == name {
			return u, nil
		}
	}
	return nil, fmt.Errorf(`Failed to find user named '%s'`, name)
}

// GetUserAlias returns the user with the given alias, failing
// finding such a user, it returns the user with the given name.
func (c *conf) GetUserAlias(name string) (*githubUser, error) {
	for _, u := range c.Users {
		if u.Alias == name {
			return u, nil
		}
	}
	return c.GetUserNamed(name)
}

// SetUser sets the default user for this session.
func (c *conf) SetUser(user string) error {
	for _, u := range c.Users {
		if u.Name == user {
			c.DefaultUser = user
			c.UserSpecified = true
			return nil
		}
	}
	return fmt.Errorf("Failed to set default Config user to '%s': no such user found", user)
}

func (c *conf) readFile(in string) error {
	if "" == in {
		in = filepath.Join(os.Getenv("HOME"), ".ebw.yml")
	}
	glog.Infof(`Reading config file %s`, in)
	raw, err := ioutil.ReadFile(in)
	if nil != err {
		glog.Infof(`Failed to read config file %s`, in)
		return nil
	}
	return yaml.Unmarshal(raw, c)
}

// getUserForDir returns the user and token for the git repo containing
// the given directory. If an empty string is supplied as the directory, the
// current working directory is used instead.
func getUserForDir(d string) (user, token string, err error) {
	if `` == d {
		d, err = os.Getwd()
		if nil != err {
			return ``, ``, util.Error(err)
		}
	}
	repo, err := git2go.OpenRepositoryExtended(d, 0, `/`)
	if nil != err {
		return ``, ``, util.Error(err)
	}
	defer repo.Free()

	origin, err := repo.Remotes.Lookup(`origin`)
	if nil != err {
		return ``, ``, util.Error(err)
	}
	defer origin.Free()

	u, err := url.Parse(origin.Url())
	if nil != err {
		return ``, ``, util.Error(err)
	}

	if nil == u.User {
		return ``, ``, ErrUnknownUser
	}
	password, ok := u.User.Password()
	if !ok {
		return ``, ``, ErrUnknownUser
	}

	return u.User.Username(), password, nil
}
