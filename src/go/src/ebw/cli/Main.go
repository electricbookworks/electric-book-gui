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

func doError(err error) {
	if nil==err {
		return
	}
	glog.Error(err)
	os.Exit(1)
}

func Main() {
	configFile := flag.String("config", "", "Location of configuration file (default is $HOME/.ebw.yml)")
	user := flag.String("u", "", "Set the default user to this user (based on alias in config file)")

	flag.Parse()

	doError(config.ReadConfigFile(*configFile))
	if "" != *user {
		doError(config.Config.SetUser(*user))
	} else {
		rootDir, err := git.GitFindRepoRootDirectory(``)
		if nil == err {
			repoUser, _, err := git.GitRemoteRepo(rootDir, ``)
			if nil == err {
				if err := config.Config.SetUser(repoUser); nil != err {
					fmt.Printf("Since we're in a repo directory, we're trying to set the user to the repo user: %s.\nThis failed.\nUse -u flag to force a particular user.\n",
						repoUser)
					doError(err)
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
		doError(err)
	}
}
