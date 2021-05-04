package print

import (
	"fmt"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"strings"

	"github.com/golang/glog"
	`github.com/juju/errors`

	"ebw/book"
	`ebw/environ`
	"ebw/util"
)

// FindFileLists finds all the 'file-list' files in the repoPath,
// and returns an array of the directories where they were found
// relative to the repoPath
func FindFileLists(repoPath string) ([]string, error) {
	glog.Infof(`FindFileLists(%s)`, repoPath)
	files := []string{}
	if err := filepath.Walk(repoPath, func(path string, fi os.FileInfo, err error) error {
		if nil != err {
			return err
		}
		// If the file is a directory, we just ignore it
		if fi.IsDir() {
			return nil
		}
		if `file-list` == filepath.Base(path) {
			rel, err := filepath.Rel(repoPath, filepath.Dir(path))
			if nil != err {
				return util.Error(err)
			}
			// Ensure that no part of the file path starts with _
			parts := filepath.SplitList(rel)
			include := true
			for _, p := range parts {
				glog.Infof(`Checking part %s of %s`, p, rel)
				if strings.HasPrefix(p, `_`) {
					include = false
				}
			}
			if include {
				files = append(files, rel)
			}
		}
		return nil
	}); nil != err {
		return nil, util.Error(err)
	}
	glog.Infof(`Returning files = %s`, strings.Join(files, `,`))
	return files, nil
}

// PrintLocal prints the book using the localhost for printing - not as safe as printing
// in a container, but on the other hand much easier to manage/code.
func PrintLocal(repoPath, bookName, printOrScreen, fileListDir string, C chan PrintMessage) (string, error) {
	runjs, err := util.FileExists(filepath.Join(repoPath, `run.js`))
	if nil!=err {
		return ``, errors.Trace(err)
	}
	if runjs {
		return printLocalWithRunJs(repoPath, bookName, printOrScreen, fileListDir, C)
	}
	glog.Infof(`PrintLocal: fileListDir = %s`, fileListDir)
	if `` == printOrScreen {
		printOrScreen = `print`
	}

	bookConfig, err := book.ReadConfig(repoPath)
	if nil != err {
		return ``, err
	}
	configDestination := bookConfig.GetDestinationDir()

	outputName := bookName + `-` + printOrScreen + `.pdf`

	logOut, logErr := PrintLogWriter(C, `info`), PrintLogWriter(C, `error`)
	defer func() {
		logOut.Close()
		logErr.Close()
	}()
	cout, cerr := io.MultiWriter(os.Stdout, logOut), io.MultiWriter(os.Stderr, logErr)

	if err := RvmRun(cout, cerr, repoPath, `gem`, `install`, `bundler`); nil != err {
		glog.Errorf(`Error %s: gem install bundler : %s`, repoPath, err.Error())
		return ``, err
	}
	if err := RvmRun(cout, cerr, repoPath, `bundle`,`update`,`--all`,`--local`,`--retry`,`5`); nil!=err {
		glog.Errorf(`Error %s: bundle update --all --retry 5: %s`, repoPath, err.Error() )
		return ``, err
	}
	if err := RvmRun(cout, cerr, repoPath, `bundle`, `install`,`--retry`,`5`); nil != err {
		glog.Errorf(`Error %s: bundle install: %s`, repoPath, err.Error())
		return ``, err
	}

	// bundle exec jekyll build --config="_config.yml,_configs/_config.`
	// + printOrScreen + `-pdf.yml"
	jekyllConfig := []string{
		`_config.yml`, filepath.Join(`_configs`, `_config.`+printOrScreen+`-pdf.yml`),
	}
	if bookConfig.MathjaxEnabled {
		mjConfig := filepath.Join(`_configs`, `_config.mathjax-enabled.yml`)
		exists, err := util.FileExists(filepath.Join(repoPath, mjConfig))
		if nil != err {
			return ``, err
		}
		if exists {
			jekyllConfig = append(jekyllConfig, mjConfig)
		}
	}
	jekyllConfigArg := strings.Join(jekyllConfig, `,`)

	if err := RvmRun(cout, cerr, repoPath, `bundle`, `exec`, `jekyll`, `build`, `--config`,
		jekyllConfigArg); nil != err {
		glog.Errorf(`Error %s: bundle exec jekyll build --config %s : %s`,
			repoPath, jekyllConfigArg, err.Error())
		return ``, err
	}
	if bookConfig.MathjaxEnabled {
		cmd := exec.Command(`phantomjs`, `render-mathjax.js`)
		cmd.Dir = filepath.Join(repoPath, configDestination /*`_site`*/, `assets`, `js`)
		cmd.Stderr, cmd.Stdout = cerr, cout
		if err := cmd.Run(); nil != err {
			glog.Errorf(`Error %s: phantomjs render-mathjax.js : %s`, cmd.Dir, err.Error())
			return ``, err
		}
	}
	outputDir := filepath.Join(repoPath, `_output`)
	os.Mkdir(outputDir, 0755)

	cmd := exec.Command(`prince`, `-v`, `-l`, `file-list`, `-o`,
		filepath.Join(outputDir, outputName), `--javascript`)
	cmd.Stdout, cmd.Stderr = cout, cerr
	cmd.Dir = filepath.Join(repoPath, configDestination /*`_html`*/, fileListDir)

	// THIS ONE WORKS
	//	cmd.Dir = filepath.Join(repoPath, bookConfig.GetDestinationDir(bookName, `text`))

	if err := cmd.Run(); nil != err {
		glog.Errorf(`Error %s: prince -v -l file-list -o %s/%s : %s`,
			cmd.Dir, outputDir, outputName, err.Error())
		return ``, err
	}

	output := `_output/` + outputName

	return output, nil
}

// printLocalWithRunJs uses the run.js in the repo directory to do the 
// printing of the book.
func printLocalWithRunJs(repoPath, bookName, printOrScreen, fileListDir string, C chan PrintMessage) (string, error) {
	glog.Infof(`Printing local with runjs in %s`, repoPath)
	glog.Infof(`printOrScreen = %s, bookName = %s, fileListDir = %s`, printOrScreen, bookName, fileListDir)

	logOut, logErr := PrintLogWriter(C, `info`), PrintLogWriter(C, `error`)
	defer func() {
		logOut.Close()
		logErr.Close()
	}()
	cout, cerr := io.MultiWriter(os.Stdout, logOut), io.MultiWriter(os.Stderr, logErr)

	fmt.Fprintln(cout, `Using run.js to print book in ` + repoPath)

	env, err := environ.NewEnviron(``, nil)
	if nil!=err {
		return ``, errors.Trace(err)
	}
	npm, err := env.Command(`npm`,`install`)	// was `node install`
	if nil!=err {
		return ``, errors.Trace(err)
	}
	npm.Dir = repoPath
	npm.Stdout, npm.Stderr = cout, cerr	
	if err := npm.Run(); nil!=err {
		return ``, fmt.Errorf(`npm install failed: %w`, err)
	}

	bundle, err := env.Command(`bundle`, `install`)
	if nil!=err {
		return ``, errors.Trace(err)
	}
	bundle.Stdout, bundle.Stderr = cout, cerr
	bundle.Dir = repoPath
	if err := bundle.Run(); nil!=err {
		glog.Errorf(`bundle install failed: %s`, err.Error())
		return ``, fmt.Errorf(`error running bundle install: %w`, err)
	}

	// gem := exec.Command(`gem`,`install`,`-g`)
	// gem.Stdout, gem.Stderr = cout, cerr
	// gem.Dir = repoPath
	// if err := ruby.Cmd(``, gem); nil!=err {
	// 	return ``, fmt.Errorf(`failed to set ruby env for gem install: %w`, err)
	// }
	// if err := gem.Run(); nil!=err {
	// 	return ``, fmt.Errorf(`error running gem install: %w`, err)
	// }
	if `screen`==printOrScreen {
		printOrScreen = `screen-pdf`
	}
	if `print`==printOrScreen {
		printOrScreen = `print-pdf`
	}
	glog.Infof(`About to run %s`, strings.Join([]string{`node`,`run.js`,`-f`,printOrScreen, `-b`, filepath.Dir(fileListDir)}, ` `))
	destFile := fmt.Sprintf(`_output/%s-%s.pdf`, filepath.Dir(fileListDir), printOrScreen)
	os.MkdirAll(filepath.Join(repoPath, filepath.Dir(destFile)), 0755)
	run, err := env.Command(`node`,`run.js`,`-f`,printOrScreen, `-b`, filepath.Dir(fileListDir))
	if nil!=err {
		return ``, errors.Trace(err)
	}
	run.Stdout, run.Stderr = cout, cerr
	run.Dir = repoPath
	if err := run.Run(); nil!=err {
		return ``, fmt.Errorf(`run failed: %w`, err)
	}
	return destFile, nil
}