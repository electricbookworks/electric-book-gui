package config

import (
	"bufio"
	"ebw/util"
	"fmt"
	"io/ioutil"
	"os"
	"strings"

	"github.com/golang/glog"
	jerrors "github.com/juju/errors"
	"gopkg.in/yaml.v3"
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

	fileroot string `yaml:"-"`
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
	c.fileroot = root
	return c.loadAllowedUsers()
}

func (c *config) loadAllowedUsers() error {
	allowedUsersFilename := c.fileroot + `-users.txt`
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

func (c *config) IsCorrectlyConfigured() bool {
	return `your-client-id-string-here`!=c.Github.Client
}

func readString(msg string, def string) (string, error) {
	for {
		fmt.Print(msg)
		if ``!=def {
			fmt.Printf(` (default %s)`, def)
		}
		fmt.Print(`? `)
		in, err := bufio.NewReader(os.Stdin).ReadString('\n')
		if nil!=err {
			return ``, err
		}
		in = strings.TrimSpace(in)
		if ``!=in {
			return in, nil
		}
		if ``!=def {
			return def, nil
		}
	}
}

func (c *config) Configure() error {
	var err error
	var configFilename string
	idx := 0
	for {
		configFilename = fmt.Sprintf("%s-%d.yml", c.fileroot, idx)
		_, err = os.Stat(configFilename)
		if nil==err {
			idx++
			continue
		}
		if os.IsNotExist(err) {
			break
		}
		return jerrors.Trace(err)
	}
	var configurable = struct {
		SessionAuth string `yaml:"session_auth"`
		SessionEncrypt string `yaml:"session_encrypt"`
		AllowedUsers []string `yaml:"allowed_users"`
		Github github `yaml:"github"`
	} {
		SessionAuth: util.RandomString(64),
		SessionEncrypt: util.RandomString(32),
	}

	fmt.Print(`
===============================================
CONFIGURING ELECTRIC BOOK MANAGER

Looks like this is the first time you're running EBM. We need to configure.
`)
	localServer, err := readString(`Where is your server running`, `localhost:16101`)
	if nil!=err {
		return err
	}
	githubUsername, err := readString(`What is your Github username`,``)
	if nil!=err {
		return err
	}
	fmt.Println(`
------------------------------------------------------------
1. Please go to https://github.com/settings/applications/new

2. Give the application a name (ElectricBookManager).

3. Set 

   Homepage URL : http://` + localServer + `
   Authorization callback URL: http://` + localServer + `/github/auth

4. Click 'Register Application'

5. On the next page, you will see the Client ID value.
`)
	configurable.Github.Client, err = readString(`   Enter the Client ID value`,``)
	if nil!=err {
		return err
	}
	fmt.Println(`
6. Press 'Generate a new client secret'.
`)
	configurable.Github.Secret, err = readString(`   Enter the Client Secret`,``)	

	configurable.AllowedUsers = []string{ githubUsername }
	out, err := os.Create(configFilename)
	if nil!=err {
		return jerrors.Trace(err)
	}
	defer out.Close()

	return jerrors.Trace(yaml.NewEncoder(out).Encode(configurable))
}