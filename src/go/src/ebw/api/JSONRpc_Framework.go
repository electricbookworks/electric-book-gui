package api

import (
	"context"
	"net/http"

	"ebw/git"
)

type Connection struct {
	W      http.ResponseWriter
	R      *http.Request
	Client *git.Client
	User   string
}

func (c *Connection) GetContext() context.Context {
	return c.R.Context()
}

type API struct {
	*Connection
}

func NewConnection(w http.ResponseWriter, r *http.Request, f func(*Connection) error) error {
	client, err := git.ClientFromWebRequest(w, r)
	if nil != err {
		return err
	}
	username, err := git.Username(client)
	if nil != err {
		return err
	}
	conn := &Connection{w, r, client, username}
	return f(conn)
}

func (c *Connection) Context(f func(*API) error) error {
	context := &API{Connection: c}
	return f(context)
}
