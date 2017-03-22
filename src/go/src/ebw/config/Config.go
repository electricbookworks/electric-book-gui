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
	Github   *github     `yaml:"github"`
	Server   string      `yaml:"server"`
	Database database    `yaml:"database"`
	GitCache string      `yaml:"git_cache"`
	Print    printserver `yaml:"print"`
}

func (c config) String() string {
	raw, _ := yaml.Marshal(&c)
	return string(raw)
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
