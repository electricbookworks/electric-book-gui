package environ

import (
	`fmt`
	`os/exec`

	`github.com/juju/errors`

	`ebw/ruby`
	`ebw/node`
)
type Environ struct {
	Rbdir string
	Env map[string]string
}

func NewEnviron(rbdir string, env map[string]string) (*Environ, error) {
	var err error
	if nil==env {
		env = map[string]string{}
	}
	env, err = ruby.Env(rbdir, node.Env(env))
	if nil!=err {
		return nil, errors.Trace(err)
	}
	return &Environ{rbdir, env}, nil
}

func (e *Environ) Command(name string, args ...string) *exec.Cmd {
	c := exec.Command(name, args...)
	for k, v := range e.Env {
		c.Env = append(c.Env, fmt.Sprintf("%s=%s", k,v))
	}
	return c
}