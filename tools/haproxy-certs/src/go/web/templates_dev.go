// +build dev

package web

import ("html/template")

func templates() (*template.Template, error) {
	return loadTemplates()
}
