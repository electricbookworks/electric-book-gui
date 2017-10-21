package cli

import (
	"fmt"

	"github.com/craigmj/commander"

	"ebw/cli/config"
	// "ebw/git"
)

func WhichUserCommand() *commander.Command {
	return commander.NewCommand(`which-user`, `Show the user details`,
		nil,
		func([]string) error {
			c := config.Config
			user, err := c.GetUser()

			fmt.Println(user.Name, user.Token)
			return err
		})
}
