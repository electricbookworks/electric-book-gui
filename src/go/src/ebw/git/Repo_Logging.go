package git

import (
	"fmt"
	"runtime"

	"github.com/sirupsen/logrus"
	git2go "github.com/libgit2/git2go/v31"
)

// Infof logs the format and args as an sprintf info level log message
func (r *Repo) Infof(format string, args ...interface{}) {
	_, file, line, _ := runtime.Caller(1)
	if nil == r.Log {
		r.Log = logrus.New().WithFields(logrus.Fields{`username`: r.Client.Username})
	}
	r.Log.WithFields(logrus.Fields{
		`file`: fmt.Sprintf(`%s:%d`, file, line),
	}).Infof(format, args...)
}

// Error logs an error if an error is set, or returns nil
func (r *Repo) Error(err error) error {
	if nil == r.Log {
		r.Log = logrus.New().WithFields(logrus.Fields{`username`: r.Client.Username})
	}
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

// Errorf logs an error from the formatter and arguments describing the error
func (r *Repo) Errorf(formatter string, args ...interface{}) error {
	if nil == r.Log {
		r.Log = logrus.New().WithFields(logrus.Fields{`username`: r.Client.Username})
	}
	_, file, line, _ := runtime.Caller(1)

	err := fmt.Errorf(formatter, args...)
	r.Log.WithFields(logrus.Fields{
		`file`: fmt.Sprintf(`%s:%d`, file, line),
	}).Error(err)
	return err
}
