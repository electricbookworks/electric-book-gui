package logger

import ()

type Logger interface {
	With(map[string]interface{}) Logger
	Infof(f string, args ...interface{})
	Errorf(f string, args ...interface{})
	ErrorDepth(d int, f string, args ...interface{})
	Error(err error)
}
