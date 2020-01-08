package web

import (
	"os"
	"io/ioutil"
	"html/template"
	"path/filepath"

	"github.com/juju/errors"
)

func loadTemplates() (*template.Template, error) {
	t := template.New("").Funcs(map[string]interface{}{
	})

	rootPath := "public"
	if err := filepath.Walk(rootPath, func(n string, i os.FileInfo, err error) error {
		if nil!=err {
			return err
		}
		if i.IsDir() {
			// return filepath.SkipDir if a directory we don't want to parse
			if "bower_components"==filepath.Base(n) {
				return filepath.SkipDir
			}
			return nil
		}
		if filepath.Ext(n)==".html" {
			raw, err := ioutil.ReadFile(n)
			if nil!=err {
				return err
			}
			name := n[len(rootPath)+1:]
			if _, err := t.New(name).Parse(string(raw)); nil!=err {
				return errors.Annotatef(err, "Parsing template %s", n)
			}
			log.Infof("Parsed template %s as %s", n, name)
		}
		return nil
	}); nil!=err {
		return nil, err
	}
	return t, nil
}
