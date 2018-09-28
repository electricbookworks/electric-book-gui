package main

import (
	"flag"
	"fmt"
	"os"
	// "net/http"

	"github.com/craigmj/commander"
	_ "github.com/go-sql-driver/mysql"
	"github.com/golang/glog"

	"ebw/config"
	// "ebw/database"
	"ebw/print"
	"ebw/www"
	"ebw/cli"
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

func main() {
	var err error
	cfg := flag.String("cfg", "electricbook", "Root path for configuration files")
	// rollback := flag.String("rollback", "", "Rollback the database")

	flag.Parse()

	if err = config.Config.Load(*cfg); nil != err {
		glog.Errorf("Failed to load config files with config %s: %s", *cfg, err.Error())
		os.Exit(1)
	}

	// if err = database.Open(config.Config.Database.Connect); nil != err {
	// 	glog.Errorf("Failed to connect to database: %s", err.Error())
	// 	os.Exit(1)
	// }
	// if "" != *rollback {
	// 	if err := database.Rollback(*rollback); nil != err {
	// 		glog.Errorf("Rollback failed: %s", err)
	// 		os.Exit(1)
	// 	}
	// 	os.Exit(0)
	// }
	// if err = database.Migrate(); nil != err {
	// 	glog.Errorf("Migration failed: %s", err)
	// 	os.Exit(1)
	// }
	// defer database.Close()

	if err := commander.Execute(flag.Args(), VersionCommand, www.WebCommand,
		print.PrintCommand, cli.ListWatchersCommand); nil != err {
		panic(err)
	}
}
