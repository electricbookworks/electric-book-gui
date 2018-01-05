package api

//go:generate golait2 -logtostderr gen -out jsonrpc/http.go -type API -in ebw/api/JSONRpc.go -tem go-connection -connectionClass Connection -connectionConstructor NewConnection
//go:generate golait2 -logtostderr gen -out jsonrpc/ws.go -type API -in ebw/api/JSONRpc.go -tem gows-connection -connectionClass Connection -connectionConstructor NewConnection
//go:generate golait2 -logtostderr gen -out ../../../../es6/APIHttp.js -type API -in ebw/api/JSONRpc.go -tem es6
//go:generate golait2 -logtostderr gen -out ../../../../es6/APIWs.js -type API -in ebw/api/JSONRpc.go -tem es6ws
//go:generate golait2 -logtostderr gen -out ../../../../ts/APIWs.ts -type API -in ebw/api/JSONRpc.go -tem typescriptWs

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
	defers []func()
}

func (a *API) Defer(f func()) {
	if nil == a.defers {
		a.defers = []func(){}
	}
	a.defers = append(a.defers, f)
}

func (a *API) Git(owner, name string) (*git.Git, error) {
	repoDir, err := git.RepoDir(a.Client.Username, owner, name)
	if nil != err {
		return nil, err
	}
	g, err := git.OpenGit(repoDir, nil)
	if nil != err {
		return nil, err
	}
	a.Defer(func() { g.Close() })
	return g, nil
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
	defer func() {
		if nil != context.defers {
			dlen := len(context.defers)
			for i := dlen - 1; i >= 0; i-- {
				context.defers[i]()
			}
		}
	}()
	return f(context)
}
