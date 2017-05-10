package config

import (
	"fmt"
	"io/ioutil"
	"os"

	"gopkg.in/yaml.v2"
)

type database struct {
	Connect string `yaml:"connect"`
}
type github struct {
	Client string `yaml:"client"`
	Secret string `yaml:"secret"`
}

type printserver struct {
	Server string `yaml:"server"`
	Token  string `yaml:"token"`
}

type config struct {
	Github         *github     `yaml:"github"`
	Server         string      `yaml:"server"`
	Database       database    `yaml:"database"`
	GitCache       string      `yaml:"git_cache"`
	Print          printserver `yaml:"print"`
	PrintContainer string      `yaml:"print_container"`
	PrintUser      string      `yaml:"print_user"`
	AllowedUsers   []string    `yaml:"allowed_users"`
	Bind           string      `yaml:"bind"`
	Rvm            string      `yaml:"rvm"`
	RubyVersion    string      `yaml:"ruby_version"`
	SessionAuth    string      `yaml:"session_auth"`
	SessionEncrypt string      `yaml:"session_encrypt"`
}

func (c config) String() string {
	raw, _ := yaml.Marshal(&c)
	return string(raw)
}

func (c config) GetPrintContainer() string {
	if `` != c.PrintContainer {
		return c.PrintContainer
	}
	return `bookworks`
}

var Config config

func (c *config) Load(root string) error {
	err := c.load(root + ".yml")
	if nil != err {
		return err
	}
	i := 0
	for {
		err = c.load(fmt.Sprintf("%s-%d.yml", root, i))
		if nil != err {
			if os.IsNotExist(err) {
				return nil
			}
			return err
		}
		i++
	}
	return nil
}

func (c *config) load(f string) error {
	raw, err := ioutil.ReadFile(f)
	if nil != err {
		return err
	}
	return yaml.Unmarshal(raw, c)
}
