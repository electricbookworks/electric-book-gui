package www

import (
	"bytes"
	"html/template"

	"github.com/golang/glog"

	"ebw/flash"
	"ebw/util"
)

type FlashMessage struct {
	CSS     string        `json:"css"`
	Title   template.HTML `json:"title"`
	Content template.HTML `json:"html"`
}

func (c *Context) Flash(css, title, content string, args map[string]interface{}) error {
	ts := template.Must(template.New(``).Parse(title))
	tc := template.Must(template.New(``).Parse(content))

	var tsOut, tcOut bytes.Buffer
	if err := ts.Execute(&tsOut, args); nil != err {
		return util.Error(err)
	}
	if err := tc.Execute(&tcOut, args); nil != err {
		return util.Error(err)
	}
	f := &FlashMessage{
		CSS:     css,
		Title:   template.HTML(tsOut.String()),
		Content: template.HTML(tcOut.String()),
	}
	glog.Infof(`Adding FlashMessage %s: %v`, c.Session.ID, f)
	return flash.Add(c.Session.ID, f)
}

func (c *Context) FlashError(title, content string, args map[string]interface{}) error {
	return c.Flash(`error`, title, content, args)
}
func (c *Context) FlashInfo(title, content string, args map[string]interface{}) error {
	return c.Flash(`info`, title, content, args)
}
func (c *Context) FlashSuccess(title, content string, args map[string]interface{}) error {
	return c.Flash(`success`, title, content, args)
}

func (c *Context) Flashes() ([]interface{}, error) {
	f, err := flash.Find(c.Session.ID)
	return f, err
}
