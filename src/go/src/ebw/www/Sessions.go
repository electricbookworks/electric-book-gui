package www

import (
	"fmt"

	"github.com/golang/glog"
	"github.com/gorilla/sessions"

	"ebw/config"
)

var store *sessions.CookieStore

func initSessions() error {
	enc, auth := []byte(config.Config.SessionEncrypt), []byte(config.Config.SessionAuth)
	if 64 != len(auth) {
		return fmt.Errorf(`You need to set a 64-byte session_auth string in config: current string is %d bytes only`, len(auth))
	}
	if 32 != len(enc) {
		glog.Infof(`Config session_encrypt is of len %d, not 32: encryption disabled`, len(enc))
		enc = []byte{}
	}
	store = sessions.NewCookieStore(auth, enc)
	return nil
}

func (c *Context) SaveSession() error {
	return c.Session.Save(c.R, c.W)
}
