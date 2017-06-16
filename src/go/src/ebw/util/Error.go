package util

import (
	"reflect"

	"github.com/golang/glog"
	"gopkg.in/ibrt/go-xerror.v2/xerror"

	git2go "gopkg.in/libgit2/git2go.v25"
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
		glog.Infof(`ToError returing a &git2go.GitError)`)
		return gerr
	}
	err, ok := args[0].(error)
	if ok {
		return err
	}
	return xerror.New("ERROR: %v", args)

}

func Error(e ...interface{}) error {
	if len(e) == 0 {
		return nil
	}
	gerr, ok := e[0].(*git2go.GitError)
	if ok {
		glog.Infof(`Error returing a &git2go.GitError)`)
		return gerr
	}

	err := ToError(e)
	if nil == err {
		return nil
	}
	glog.ErrorDepth(1, err)
	return err
}
