package environ

import (
	`fmt`
	`os`
	`os/exec`
	`strings`

	`github.com/juju/errors`
	`github.com/golang/glog`

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
	// Copy environment variables from our environment
	for _, e := range os.Environ() {
		kv := strings.SplitN(e, "=", 2)
		if 2==len(kv) {
			// LANG seems to be the only Environment variable I need to sassc compilation to work
			k,v := kv[0], kv[1]
			if //strings.HasPrefix(k,`LC_`) || 
				`LANG`==k {
				env[k] = v
				glog.Infof(`ENV %s = %s`, k,v)
			}
		} else {
			glog.Infof(`%s split into %d`, e, len(kv))
		}
	}
	env, err = ruby.Env(rbdir, node.Env(env))
	if nil!=err {
		return nil, errors.Trace(err)
	}
	return &Environ{rbdir, env}, nil
}

func Command(name string, args...string) (*exec.Cmd, error) {
	e, err := NewEnviron(``, map[string]string{})
	if nil!=err {
		return nil, errors.Trace(err)
	}
	return e.Command(name, args...)
}

func (e *Environ) Command(name string, args ...string) (*exec.Cmd, error) {
	var err error
	name, err = LookPath(e.Env[`PATH`], name)
	if nil!=err {
		return nil, errors.Trace(err)
	}
	c := exec.Command(name, args...)
	for k, v := range e.Env {
		c.Env = append(c.Env, fmt.Sprintf("%s=%s", k,v))
	}
	return c, nil
}

