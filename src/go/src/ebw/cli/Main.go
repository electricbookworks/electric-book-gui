package cli

import (
	"context"
	"flag"
	"os"

	"github.com/craigmj/commander"
	"github.com/golang/glog"

	"ebw/cli/config"
	"ebw/git"
)

func Main() {
	configFile := flag.String("config", "", "Location of configuration file (default is $HOME/.ebw.yml)")
	user := flag.String("u", "", "Set the default user to this user (based on alias in config file)")

	flag.Parse()

	if err := config.ReadConfigFile(*configFile); nil != err {
		glog.Error(err)
		os.Exit(1)
	}
	if "" != *user {
		if err := config.Config.SetUser(*user); nil != err {
			glog.Error(err)
			os.Exit(1)
		}
	} else {
		rootDir, err := git.GitFindRepoRootDirectory(``)
		if nil == err {
			repoUser, _, err := git.GitRemoteRepo(context.Background(), rootDir, ``)
			if nil == err {
				if err := config.Config.SetUser(repoUser); nil != err {
					glog.Error(err)
					os.Exit(1)
				}
			}
		}
	}

	if err := commander.Execute(flag.Args(),
		BookCommands,
		CliCommand,
		GithubCommand); nil != err {
		glog.Error(err)
		os.Exit(1)
	}
}
