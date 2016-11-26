package util

import (
	"reflect"

	"github.com/golang/glog"
	"gopkg.in/ibrt/go-xerror.v2/xerror"
)

func isNil(i []interface{}) bool {
	if 0 == len(i) || nil == i[0] {
		return true
	}
	v := reflect.ValueOf(i)
	return reflect.Interface == v.Kind() && v.IsNil()
}

func ToError(args ...interface{}) error {
	if isNil(args) || 0 == len(args) {
		return nil
	}
	switch t := args[0].(type) {
	case error:
		if 1 == len(args) {
			return t
		}
		if s, ok := args[1].(string); ok {
			return xerror.Wrap(t, s, args[2:]...)
		}
		return xerror.Wrap(t, "ERROR: %v", args[2:])
	case string:
		return xerror.New(t, args[1:]...)
	default:
		return xerror.New("ERROR: %v", args)
	}
}

func Error(e ...interface{}) error {
	err := ToError(e)
	if nil == err {
		return nil
	}
	glog.ErrorDepth(1, err)
	return err
}
