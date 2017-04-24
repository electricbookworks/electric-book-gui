package book

import (
	"gopkg.in/yaml.v2"
	"io/ioutil"
	"path/filepath"

	"ebw/util"
)

type Config struct {
	Destination string `yaml:"destination"`
}

func (c *Config) GetDestinationDir(subpaths ...string) string {
	args := make([]string, 1, len(subpaths)+1)
	if `` == c.Destination {
		args[0] = `_site`
	} else {
		args[0] = c.Destination
	}
	args = append(args, subpaths...)
	return filepath.Join(args...)
}

func ReadConfig(dir string) (*Config, error) {
	raw, err := ioutil.ReadFile(filepath.Join(dir, `_config.yml`))
	if nil != err {
		return nil, util.Error(err)
	}
	c := &Config{}
	if err := yaml.Unmarshal(raw, c); nil != err {
		return nil, util.Error(err)
	}
	return c, nil
}
