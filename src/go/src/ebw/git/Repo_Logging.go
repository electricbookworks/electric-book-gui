package git

import (
	"fmt"
	"runtime"

	"github.com/sirupsen/logrus"
	git2go "gopkg.in/libgit2/git2go.v25"
)

// Infof logs the format and args as an sprintf info level log message
func (r *Repo) Infof(format string, args ...interface{}) {
	_, file, line, _ := runtime.Caller(1)
	r.Log.WithFields(logrus.Fields{
		`file`: fmt.Sprintf(`%s:%d`, file, line),
	}).Infof(format, args...)
}

// LogError logs an error if an error is set, or returns nil
func (r *Repo) LogError(err error) error {
	if nil == err {
		return nil
	}
	_, file, line, _ := runtime.Caller(1)
	gerr, ok := err.(*git2go.GitError)
	if ok {
		r.Log.WithFields(logrus.Fields{
			`file`: fmt.Sprintf(`%s:%d`, file, line),
		}).Errorf(`git2go.GitError: %s`, gerr.Error())
		return gerr
	}
	r.Log.WithFields(logrus.Fields{
		`file`: fmt.Sprintf(`%s:%d`, file, line),
	}).Error(err)
	return err
}
