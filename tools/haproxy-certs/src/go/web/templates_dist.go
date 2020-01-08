// +build !dev

package web

import ("html/template")

var _templates = template.Must(loadTemplates())

func templates() (*template.Template,error) {
	return _templates, nil
}
