package cli

import (
	"fmt"

	"github.com/craigmj/commander"
	// "github.com/golang/glog"

	"ebw/cli/config"
)

func CliCommand() *commander.Command {
	return commander.NewCommand("cli",
		"CLI related commands",
		nil,
		func(args []string) error {
			return commander.Execute(args, CliListUsersCommand, CliUserCommand)
		})
}

func CliListUsersCommand() *commander.Command {
	return commander.NewCommand("users",
		"List the set cli-users for this user",
		nil,
		func([]string) error {
			for _, u := range config.Config.Users {
				fmt.Printf("%s : %s\n", u.Name, u.Token)
			}
			return nil
		})
}

func CliUserCommand() *commander.Command {
	return commander.NewCommand(`user`,
		`Show the current user that the cli is using`,
		nil,
		func([]string) error {
			u, err := config.Config.GetUser()
			if nil != err {
				return err
			}
			fmt.Println(u.Name)
			fmt.Println(u.Token)
			return nil
		})
}
