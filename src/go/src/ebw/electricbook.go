package main

import (
	"flag"
	"fmt"
	"os"
	// "net/http"

	"github.com/craigmj/commander"
	_ "github.com/go-sql-driver/mysql"
	"github.com/golang/glog"
	jerrors `github.com/juju/errors`

	"ebw/config"
	// "ebw/database"
	`ebw/environ`
	`ebw/node`
	"ebw/print"
	`ebw/ruby`
	"ebw/www"
	"ebw/cli"
	"ebw/util"
)

func VersionCommand() *commander.Command {
	return commander.NewCommand("version",
		"Return the version of the electricbook system",
		nil,
		func([]string) error {
			fmt.Println("v 0.3 March 27, 2017")
			return nil
		})
}

func doError(err error) {
	if nil==err {
		return
	}
	glog.Error(err)
	fmt.Fprintln(os.Stderr, jerrors.ErrorStack(err))
	os.Exit(1)
}

func main() {
	var err error
	cfg := flag.String("cfg", "electricbook", "Root path for configuration files")
	// rollback := flag.String("rollback", "", "Rollback the database")

	flag.Parse()

	if err = config.Config.Load(*cfg); nil != err {
		glog.Errorf("Failed to load config files with config %s: %w", *cfg, err)
		doError(err)
	}

	// Determine whether we are correctly configured, or whether we need to run configuration
	if !config.Config.IsCorrectlyConfigured() {
		doError(config.Config.Configure())
		fmt.Println(`Please restart for configuration changes to be effected`)
		os.Exit(0)
	}

	if err := commander.Execute(flag.Args(), VersionCommand, www.WebCommand,
		print.PrintCommand, cli.ListWatchersCommand, util.DiffCommand,
		node.InstallNodeCommand, node.RunNodeCommand,
		node.NodeEnvCommand,
		ruby.RubyInstallCommand, ruby.RubyEnvCommand, environ.EnvCommand,
	); nil != err {
		doError(err)
	}
}
