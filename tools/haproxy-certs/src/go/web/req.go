package web

import (
	"net/http"
	
	"haproxy-certs/database"
)

type req struct {
	R *http.Request
	W http.ResponseWriter
	Tx *database.Tx
}

type handler func(r *req) error

func (r *req) Error(err error) error {
	doError(r.W, r.R, err)
	return nil
}

// Render renders an html template with the given args. The templates
// name is the full, pathed name of the template in the 'public/' directory.
func (r *req) Render(page string, args interface{}) error {
	t, err := templates()
	if nil!=err {
		return err
	}
	if err := t.ExecuteTemplate(r.W, page, args); nil!=err {
		return r.Error(err)
	}

	return nil
}

func (h handler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	doError(w, r, database.Transact(func(tx *database.Tx) error {
		r := &req{
			R: r,
			W: w,
			Tx: tx,
		}
		return h(r)
	}))
}

