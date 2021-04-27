package node

import (
	`fmt`
	`net/http`
	`strings`
	`os`
	`os/exec`
	`path/filepath`

	`github.com/golang/glog`
	`github.com/juju/errors`
)

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

func InstallNvm(todir string) error {
	nvmExists, err := fileExists(filepath.Join(todir, `nvm`, `nvm.sh`))
	if nil!=err || nvmExists {
		return err
	}
	os.MkdirAll(todir, 0755)
	script, err := http.Get(`https://raw.githubusercontent.com/nvm-sh/nvm/v0.37.2/install.sh`)
	if nil!=err {
		return fmt.Errorf(`Failed to download nvm install script: %w`, err)
	}	
	defer script.Body.Close()	

	bash := exec.Command(`/bin/bash`)
	bash.Stdin = script.Body
	bash.Stderr, bash.Stdout = os.Stderr, os.Stdout
	bash.Env = []string{`XDG_CONFIG_HOME=`+todir}

	return errors.Trace(bash.Run())
}

func InstallNode(todir string) error {
	exists, err := fileExists(filepath.Join(todir, `bin`, `node`))
	if nil!=err || exists {
		return err
	}
	tdir := filepath.Base(todir)
	os.MkdirAll(tdir, 0755)

	bash := exec.Command(`/bin/bash`)
	bash.Dir = tdir
	bash.Stdout, bash.Stderr = os.Stdout, os.Stderr
	bash.Stdin = strings.NewReader(`
curl https://nodejs.org/dist/v14.16.0/node-v14.16.0-linux-x64.tar.xz | tar -xJ
`)
	if err := bash.Run(); nil!=err {
		return errors.Trace(err)
	}
	return nil
}

func Command(indir, nodeCmd string, args ...string) *exec.Cmd {
	npath, err := filepath.Abs(`./node-v14.16.0-linux-x64/bin/`)
	if nil!=err {
		panic(err)
	}
	glog.Infof(`cmd: %s %s`, filepath.Join(npath, nodeCmd), strings.Join(args, ` `))
	cmd := exec.Command(filepath.Join(npath, nodeCmd), args...)
	cmd.Dir = indir
	return cmd
}

func Path() string {
	npath, err := filepath.Abs(`./node-v14.16.0-linux-x64/bin/`)
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