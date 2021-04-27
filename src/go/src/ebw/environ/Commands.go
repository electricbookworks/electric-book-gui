package environ

import (
	`strings`
	`fmt`
	`os`
	`os/exec`

	`github.com/craigmj/commander`
	`github.com/juju/errors`

	`ebw/node`
	`ebw/ruby`
)

func EnvCommand() *commander.Command {
	return commander.NewCommand(`env`,
	`Returns the environment for ebm tool running`,
	nil,
	func([]string) error {
		env, err := Env(``, map[string]string{})
		if nil!=err {
			return err
		}
		for k, v := range env {
			if ``!=v {
				fmt.Printf("export %s=%s\n", k, v)
			}
		}
		return nil
	})
}

func Env(rbdir string, env map[string]string) (map[string]string, error) {
	var err error
	env, err = ruby.Env(rbdir, node.Env(env))
	if nil!=err {
		return nil, errors.Trace(err)
	}
	return env, nil
}

func Path(rbdir string) string {
	return strings.Join([]string{
		os.Getenv(`PATH`),
		node.Path(),
		ruby.Path(rbdir),
	}, `:`)
}

func Cmd(rbdir string, c *exec.Cmd, env map[string]string) error {
	var err error
	env, err = Env(rbdir, env)
	if nil!=err {
		return err
	}
	for k, v := range env {
		c.Env = append(c.Env, fmt.Sprintf("%s=%s", k, v))
	}
	return nil
}