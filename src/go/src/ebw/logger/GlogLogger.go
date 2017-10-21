package logger

import (
	"encoding/json"
	"fmt"
	"github.com/golang/glog"
)

type GlogLogger struct {
	Args map[string]interface{}
}

func NewGlogLogger() *GlogLogger {
	return &GlogLogger{Args: make(map[string]interface{})}
}

func (g *GlogLogger) With(args map[string]interface{}) Logger {
	n := NewGlogLogger()
	for k, v := range g.Args {
		n.Args[k] = v
	}
	for k, v := range args {
		n.Args[k] = v
	}
	return n
}

func (g *GlogLogger) line(depth int, f string, args ...interface{}) string {
	jraw, err := json.Marshal(g.Args)
	if nil != err {
		jraw = []byte(err.Error())
	}
	return fmt.Sprintf(f, args...) + "\t" + string(jraw)
}

func (g *GlogLogger) InfoDepth(d int, f string, args ...interface{}) {
	glog.InfoDepth(d+1, g.line(2, f, args))
}

func (g *GlogLogger) Infof(f string, args ...interface{}) {
	glog.InfoDepth(1, g.line(2, f, args))
}

func (g *GlogLogger) ErrorDepth(d int, f string, args ...interface{}) {
	glog.ErrorDepth(d+1, g.line(2+d, f, args))
}

func (g *GlogLogger) Errorf(f string, args ...interface{}) {
	glog.ErrorDepth(1, g.line(2, f, args))
}

func (g *GlogLogger) Error(err error) {
	glog.ErrorDepth(1, g.line(2, `%s`, err.Error()))
}
