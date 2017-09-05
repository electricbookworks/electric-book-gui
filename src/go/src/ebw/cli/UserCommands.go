package cli

import (
	"fmt"

	"github.com/craigmj/commander"

	"ebw/git"
)

func WhichUserCommand() *commander.Command {
	return commander.NewCommand(`which-user`, `Show the user details for current dir`,
		nil,
		func([]string) error {
			user, token, err := git.GetUserForDir(``)
			fmt.Println(user, token)
			return err
		})
}
