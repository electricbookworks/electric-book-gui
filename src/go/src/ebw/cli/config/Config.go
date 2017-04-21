package config

import (
	"errors"
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"

	"github.com/golang/glog"

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

func (c *conf) readFile(in string) error {
	if "" == in {
		in = filepath.Join(os.Getenv("HOME"), ".ebw.yml")
	}
	glog.Infof(`Reading config file %s`, in)
	raw, err := ioutil.ReadFile(in)
	if nil != err {
		return err
	}
	return yaml.Unmarshal(raw, c)
}
