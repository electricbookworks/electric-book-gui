package cli

import (
	"flag"
	"fmt"
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
			repoUser, _, err := git.GitRemoteRepo(rootDir, ``)
			if nil == err {
				if err := config.Config.SetUser(repoUser); nil != err {
					fmt.Printf("Since we're in a repo directory, we're trying to set the user to the repo user: %s.\nThis failed.\nUse -u flag to force a particular user.\n",
						repoUser)
					glog.Error(err)
					os.Exit(1)
				}
			}
		}
	}

	if err := commander.Execute(flag.Args(),
		BookCommands,
		CliCommand,
		GithubCommand,
		PullCommand,
		WhichUserCommand,
		GitCommands,
	); nil != err {
		glog.Error(err)
		os.Exit(1)
	}
}
