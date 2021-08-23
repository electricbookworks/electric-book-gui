package ruby

import (
	`fmt`
	`os/exec`
	`io`
	`os`
	`net/http`
	`path/filepath`

	`github.com/juju/errors`
	`github.com/golang/glog`

	`ebw/util`
)

func download(srcUrl, destFile string) error {
	in, err := http.Get(srcUrl)
	if nil!=err {
		return errors.Trace(err)
	}
	defer in.Body.Close()
	out, err := os.Create(destFile)
	if nil!=err {
		return errors.Trace(err)
	}
	defer out.Close()
	if _, err := io.Copy(out, in.Body); nil!=err {
		return errors.Trace(err)
	}
	return nil
}

func VersionMajor() string {
	return `2.7`
}
func Version() string {
	return VersionMajor() + `.2`
}
func Destdir(destdir string) (string, error) {
	if ``==destdir {
		destdir = `rb` + Version()
	}
	destdir, err := filepath.Abs(destdir)
	if nil!=err {
		return ``, err
	}
	return destdir, nil
}

func Install(destdir string, owner, group string) error {
	rubyVer := Version()
	rubyVerMajor := VersionMajor()
	destdir, err := Destdir(destdir)
	if nil!=err {
		return err
	}
	glog.Infof(`Checking for ruby %s`, filepath.Join(destdir, `bin`,`ruby`))
	exists, err := util.FileExists(filepath.Join(destdir, `bin`,`ruby`))
	if nil!=err {
		return errors.Trace(err)
	}
	if exists {
		return  util.SetOwner(destdir, owner, group)
	}
	glog.Infof(`Installing ruby to %s`, destdir)

	if err := exec.Command(`sudo`,`/usr/bin/apt`,`install`,`-y`,`libssl-dev`,`curl`).Run(); nil!=err {
		return errors.Trace(err)
	}
	srcDir, err := os.MkdirTemp(``, `ruby_*`)
	if nil!=err {
		return errors.Trace(err)
	}
	if err := download(`https://cache.ruby-lang.org/pub/ruby/` +rubyVerMajor + `/ruby-` + rubyVer + `.tar.bz2`,
		filepath.Join(srcDir, `ruby.tar.bz2`)); nil!=err {
		return errors.Trace(err)
	}
	tar := exec.Command(`/usr/bin/tar`,`-xf`,filepath.Join(srcDir, `ruby.tar.bz2`))
	tar.Dir = srcDir
	tar.Stdout, tar.Stderr = os.Stdout, os.Stderr
	if err := tar.Run(); nil!=err {
		return errors.Trace(err)
	}
	fmt.Println(`Src downloaded to `, srcDir)
	srcDir = filepath.Join(srcDir, `ruby-` + rubyVer)

	conf := exec.Command(filepath.Join(srcDir, `configure`),`--prefix=`+destdir)
	conf.Dir = srcDir
	conf.Stdout, conf.Stderr = os.Stdout, os.Stderr
	if err := conf.Run(); nil!=err {
		return errors.Trace(err)
	}
	make := exec.Command(`/usr/bin/make`)
	make.Dir = srcDir
	make.Stdout, make.Stderr = os.Stdout, os.Stderr
	if err := make.Run(); nil!=err {
		return errors.Trace(err)
	}
	make = exec.Command(`/usr/bin/make`,`install`)
	make.Dir = srcDir
	make.Stdout, make.Stderr = os.Stdout, os.Stderr
	if err := make.Run(); nil!=err {
		return errors.Trace(err)
	}
	os.MkdirAll(filepath.Join(destdir, `gems`),0755)
	return util.SetOwner(destdir, owner, group)
}

func Path(destdir string) string {
	destdir, err := Destdir(destdir)
	if nil!=err {
		panic(err)
	}
	return filepath.Join(destdir, `bin`)
}

// Ruby environment variables
// https://www.tutorialspoint.com/ruby/ruby_environment_variables.htm
func Env(destdir string, env map[string]string) (map[string]string, error) {
	destdir, err := Destdir(destdir)
	if nil!=err {
		return nil, err
	}
	path, ok := env[`PATH`]
	if !ok {
		path = os.Getenv(`PATH`)
	}
	for k, v := range map[string]string {
		// `DLN_LIBRARY_PATH=`,
		// `HOME=`,
		// `LOGDIR=`,
		
		/* Search path for libraries. Separate each path with a colon 
			(semicolon in DOS and Windows). */
		`RUBYLIB`: filepath.Join(destdir, `lib`,`ruby`),
		/* Used to modify the RUBYLIB search path by replacing prefix of 
			library path1 with path2 using the format path1;path2 or path1path2. */
		`RUBYLIB_PREFIX`:``,
		/* Command-line options passed to Ruby interpreter. 
			Ignored in taint mode (Where $SAFE is greater than 0).		*/
		`RUBYOPT`:``,
		/* With -S option, search path for Ruby programs. Takes precedence over PATH. Ignored in taint mode (where $SAFE is greater than 0).
		*/
		`RUBYPATH`: filepath.Join(destdir, `bin`),	
		`RUBYSHELL`:``,	//Specifies shell for spawned processes. If not set, SHELL or COMSPEC are checked.
		`PATH`: fmt.Sprintf("%s%c%s", filepath.Join(destdir, `bin`), os.PathListSeparator, path),
		`GEM_HOME`: filepath.Join(destdir, `gems`),
		`GEM_PATH`: filepath.Join(destdir, `gems`),
	} {
		env[k] = v
	}
	return env, nil
}

func Cmd(rbdir string, c *exec.Cmd, env map[string]string) error {
	rbdir, err := Destdir(rbdir)
	if nil!=err {
		return err
	}
	env, err = Env(rbdir, env)
	if nil!=err {
		return errors.Trace(err)
	}
	for k, v := range env {
		c.Env = append(c.Env, fmt.Sprintf(`%s=%s`, k, v))
	}
	return nil
}