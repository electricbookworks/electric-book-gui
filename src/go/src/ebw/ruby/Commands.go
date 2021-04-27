package ruby

import (
	`fmt`

	`github.com/craigmj/commander`
)

func RubyInstallCommand() *commander.Command {
	return commander.NewCommand(`ruby-install`,
		`Installs ruby to destination dir`,
		nil,
		func(args []string) error {
			if 0==len(args) {
				args = []string{``}
			}			
			return Install(args[0])
		})
}

func RubyEnvCommand() *commander.Command {
	return commander.NewCommand(`rbenv`,
		`Returns the ruby environment for the argument ruby dir.

		To 'source' a shell, use:

		$(electricbook rbenv)

		from the bash/zsh command line.

		`,
		nil,
		func(args []string) error {
			if 0==len(args) {
				args = []string{``}
			}
			env, err := Env(args[0], map[string]string{})
			if nil!=err {
				return err
			}
			for _, e := range env {
				fmt.Println(`export`,e)
			}
			return nil
		})
}