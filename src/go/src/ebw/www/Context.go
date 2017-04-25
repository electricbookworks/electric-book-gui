package www

import (
	"context"
	"fmt"
	"net/http"
	"strconv"

	// "github.com/google/go-github/github"
	"github.com/gorilla/mux"

	"ebw/git"
)

type Context struct {
	R      *http.Request
	W      http.ResponseWriter
	Vars   map[string]string
	D      map[string]interface{}
	Client *git.Client
}

type WebHandler func(c *Context) error

func (f WebHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	client, _ := git.ClientFromWebRequest(w, r)

	c := &Context{
		R:      r,
		W:      w,
		D:      map[string]interface{}{},
		Vars:   mux.Vars(r),
		Client: client,
	}
	if err := f(c); nil != err {
		WebError(w, r, err)
	}
}

func (c *Context) Render(templ string, data map[string]interface{}) error {
	for k, v := range data {
		c.D[k] = v
	}
	_, ok := c.D[`CMVersion`]
	if !ok {
		c.D[`CMVersion`] = `5.12.0`
	}

	_, ok = c.D[`User`]
	if !ok && (nil != c.Client) {
		c.D[`User`] = c.Client.User
	}

	_, ok = c.D[`Flashes`]
	if !ok {
		flashes, err := c.Flashes()
		if nil != err {
			return err
		}
		c.D[`Flashes`] = flashes
	}

	return Render(c.W, c.R, templ, c.D)
}

func (c *Context) P(k string) string {
	v, ok := c.Vars[k]
	if ok {
		return v
	}
	return c.R.FormValue(k)
}

func (c *Context) PI(k string) int64 {
	i, _ := strconv.ParseInt(c.P(k), 10, 64)
	return i
}

func (c *Context) Redirect(f string, args ...interface{}) error {
	http.Redirect(c.W, c.R, fmt.Sprintf(f, args...), http.StatusFound)
	return nil
}

func (c *Context) Context() context.Context {
	return c.R.Context()
}
