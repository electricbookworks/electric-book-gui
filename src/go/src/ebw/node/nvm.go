package node

import (
	`fmt`
	`strings`
	`os`
	`os/exec`
	`path/filepath`

	`github.com/golang/glog`
	`github.com/juju/errors`

	`ebw/util`
)

func Version() string {
	return `14.16.0`
}

func fileExists(f string) (bool, error) {
	_, err := os.Stat(f)
	if nil==err {
		return true, nil
	}
	if os.IsNotExist(err) {
		return false, nil
	}
	return false, errors.Trace(err)
}

func InstallNode(todir string, user, group string) error {
	tdir := filepath.Base(todir)
	os.MkdirAll(tdir, 0755)
	nodeDir := filepath.Join(tdir, `node-v` + Version() + `-linux-x64`)
	exists, err := fileExists(filepath.Join(todir, `bin`, `node`))
	if nil!=err {
		return errors.Trace(err)
	}
	if exists {
		return util.SetOwner(nodeDir, user, group)
	}

	bash := exec.Command(`/bin/bash`)
	bash.Dir = tdir
	bash.Stdout, bash.Stderr = os.Stdout, os.Stderr
	bash.Stdin = strings.NewReader(`
curl https://nodejs.org/dist/v` + Version() + `/node-v` + Version() + `-linux-x64.tar.xz | tar -xJ
`)
	if err := bash.Run(); nil!=err {
		return errors.Trace(err)
	}
	return util.SetOwner(nodeDir, user, group)
}

func Command(indir, nodeCmd string, args ...string) *exec.Cmd {
	npath, err := filepath.Abs(`./node-v` + Version() + `-linux-x64/bin/`)
	if nil!=err {
		panic(err)
	}
	glog.Infof(`cmd: %s %s`, filepath.Join(npath, nodeCmd), strings.Join(args, ` `))
	cmd := exec.Command(filepath.Join(npath, nodeCmd), args...)
	cmd.Dir = indir
	return cmd
}

func Path() string {
	npath, err := filepath.Abs(`./node-v` + Version() + `-linux-x64/bin/`)
	if nil!=err {
		panic(err)
	}
	return npath
}

func Env(env map[string]string) map[string]string {
	path, ok := env[`PATH`]
	if !ok {
		path = os.Getenv(`PATH`)
	}
	env[`PATH`] = fmt.Sprintf(`%s%c%s`, Path(), os.PathListSeparator, path)
	return env
}