package util

import (
	"fmt"
	"reflect"
	"runtime"

	"github.com/golang/glog"
	"github.com/sirupsen/logrus"
	"gopkg.in/ibrt/go-xerror.v2/xerror"

	git2go "github.com/craigmj/git2go/v31"
)

func isNil(i []interface{}) bool {
	if 0 == len(i) || nil == i[0] {
		return true
	}
	v := reflect.ValueOf(i)
	return (reflect.Interface == v.Kind() ||
		reflect.Ptr == v.Kind() ||
		reflect.Map == v.Kind() ||
		reflect.Chan == v.Kind() ||
		reflect.Slice == v.Kind() ||
		reflect.Func == v.Kind()) && v.IsNil()
}

func ToError(args []interface{}) error {
	if isNil(args) || 0 == len(args) {
		return nil
	}
	gerr, ok := args[0].(*git2go.GitError)
	if ok {
		glog.Infof(`ToError returing a &git2go.GitError: %s`, gerr.Error())
		return gerr
	}
	err, ok := args[0].(error)
	if ok {
		return err
	}
	return xerror.New("ERROR: %v", args)

}

// LogError logs an error on a logrus entry
func LogError(log *logrus.Entry, e ...interface{}) error {
	if 0 == len(e) {
		return nil
	}
	_, file, line, _ := runtime.Caller(1)
	gerr, ok := e[0].(*git2go.GitError)
	if ok {
		log.WithFields(logrus.Fields{
			`file`: fmt.Sprintf(`%s:%d`, file, line),
		}).Errorf(`git2go.GitError: %s`, gerr.Error())
		return gerr
	}
	err := ToError(e)
	if nil == err {
		return nil
	}
	log.WithFields(logrus.Fields{
		`file`: fmt.Sprintf(`%s:%d`, file, line),
	}).Error(err.Error())
	return err
}

func Error(e ...interface{}) error {
	if len(e) == 0 {
		return nil
	}
	gerr, ok := e[0].(*git2go.GitError)
	if ok {
		glog.Infof(`Error returning a &git2go.GitError: %s`, gerr.Error())
		return gerr
	}

	err := ToError(e)
	if nil == err {
		return nil
	}
	glog.ErrorDepth(1, err)
	return err
}
