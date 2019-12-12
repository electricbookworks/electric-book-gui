package config

import (
	"fmt"
	`bufio`
	`strings`
	"io/ioutil"
	"os"

	"gopkg.in/yaml.v2"
	`github.com/golang/glog`
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

type errorMailer struct {
	To         string `yaml:"to"`
	From       string `yaml:"from"`
	Host       string `yaml:"host"`
	Port       int    `yaml:"port"`
	Username   string `yaml:"username"`
	Password   string `yaml:"password"`
	SkipVerify bool   `yaml:"insecure_skip_verify"`
}

func (e errorMailer) FromTo() (string, string) {
	t, f := e.To, e.From
	if `` == f {
		f = `errors@electricbook.works`
	}
	if `` == t {
		t = `craig@lateral.co.za`
	}
	return f, t
}
func (e errorMailer) HostPort() (string, int) {
	h := e.Host
	if `` == h {
		h = `localhost`
	}
	p := e.Port
	if 0 == p {
		p = 587
	}
	return h, p
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
	ErrorMail      errorMailer `yaml:"error_mail"`
	AllowAutoLogin bool        `yaml:"allow_auto_login"`
	RecoverPanics  bool        `yaml:"recover_panics"`
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
				break
			}
			return err
		}
		i++
	}
	return c.loadAllowedUsers(root)
}

func (c *config) loadAllowedUsers(root string) error {
	allowedUsersFilename := root + `-users.txt`
	defer func() {
		glog.Infof(`Allowed users: %s`, strings.Join(c.AllowedUsers,`,`))
	}()
	in, err := os.Open(allowedUsersFilename)
	if nil!=err {
		if os.IsNotExist(err) {
			glog.Infof(`%s does not exist`, allowedUsersFilename)
			return nil
		}
		return err
	}
	defer in.Close()
	scan := bufio.NewScanner(in)
	if c.AllowedUsers == nil {
		c.AllowedUsers = []string{}
	}
	for scan.Scan() {
		line := strings.TrimSpace(scan.Text())
		if 0==len(line) || '#'==line[0] {
			continue
		}
		c.AllowedUsers = append(c.AllowedUsers, line)
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
