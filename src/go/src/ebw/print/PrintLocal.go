package print

import (
	// "fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"

	"github.com/golang/glog"

	"ebw/book"
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

func PrintLocal(repoPath, bookName, printOrScreen, fileList string, C chan PrintMessage) (string, error) {

	if `` == printOrScreen {
		printOrScreen = `print`
	}

	bookConfig, err := book.ReadConfig(repoPath)
	if nil != err {
		return ``, err
	}
	outputName := bookName + `-` + printOrScreen + `.pdf`

	if err := Rvm(repoPath, `gem`, `install`, `bundler`).Run(); nil != err {
		glog.Errorf(`Error %s: gem install bundler : %s`, repoPath, err.Error())
		return ``, err
	}
	if err := Rvm(repoPath, `bundle`, `install`).Run(); nil != err {
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

	if err := Rvm(repoPath, `bundle`, `exec`, `jekyll`, `build`, `--config`,
		jekyllConfigArg).Run(); nil != err {
		glog.Errorf(`Error %s: bundle exec jekyll build --config %s : %s`,
			repoPath, jekyllConfigArg, err.Error())
		return ``, err
	}
	if bookConfig.MathjaxEnabled {
		cmd := exec.Command(`phantomjs`, `render-mathjax.js`)
		cmd.Dir = filepath.Join(repoPath, `_site`, `assets`, `js`)
		cmd.Stderr, cmd.Stdout = os.Stderr, os.Stdout
		if err := cmd.Run(); nil != err {
			glog.Errorf(`Error %s: phantomjs render-mathjax.js : %s`, cmd.Dir, err.Error())
			return ``, err
		}
	}
	cmd := exec.Command(`prince`, `-v`, `-l`, `file-list`, `-o`,
		`../../../_output/`+outputName, `--javascript`)
	cmd.Stdout, cmd.Stderr = os.Stdout, os.Stderr
	cmd.Dir = filepath.Join(repoPath,
		bookConfig.GetDestinationDir(bookName, `text`))
	if err := cmd.Run(); nil != err {
		glog.Errorf(`Error %s: prince -v -l file-list -o ../../../_output/%s : %s`,
			cmd.Dir, outputName, err.Error())
		return ``, err
	}

	output := `repo/_output/` + outputName

	return output, nil
}
