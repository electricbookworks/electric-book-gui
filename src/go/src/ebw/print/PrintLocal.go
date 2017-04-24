package print

import (
	"fmt"
	"os"
	"os/exec"
	// "path/filepath"
	// "github.com/golang/glog"

	"ebw/book"
	"ebw/util"
)

func PrintLocal(repoPath, bookName string, C chan PrintMessage) (string, error) {
	doError := func(err error) error {
		C <- PrintMessage{Event: `error`, Data: err.Error()}
		return util.Error(err)
	}

	bookConfig, err := book.ReadConfig(repoPath)
	if nil != err {
		return ``, err
	}

	inR, inW, err := os.Pipe()
	if nil != err {
		return ``, doError(fmt.Errorf(`ERROR creating pipe: %v`, err))
	}
	go func() {
		defer inW.Close()
		inW.WriteString(`
echo 'Start of printing script'
source /usr/local/rvm/scripts/rvm
bundle install
bundle exec jekyll build --config="_config.yml,_configs/_config.print-pdf.yml"
cd ` + bookConfig.GetDestinationDir(bookName, `text`) + `
prince -v -l file-list -o ../../../_output/` + bookName + `.pdf
echo 'End of printing script'
`)
	}()

	cmd := exec.Command(`/bin/bash`)
	cmd.Dir = repoPath
	cmd.Stdin = inR
	cmd.Stdout, cmd.Stderr = os.Stdout, os.Stderr

	if err := cmd.Run(); nil != err {
		return ``, doError(fmt.Errorf(`ERROR executing build: %s`, err.Error()))
	}

	output := `_output/` + bookName + `.pdf`

	return output, nil
}
