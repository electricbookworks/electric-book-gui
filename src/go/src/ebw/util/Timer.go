package util

import (
	"time"

	"github.com/golang/glog"
)

type Timer struct {
	msg   string
	start time.Time
}

func NewTimer(msg string) *Timer {
	return &Timer{
		msg:   msg,
		start: time.Now(),
	}
}

func (t *Timer) Mark(m string) {
	el := time.Now().Sub(t.start)
	glog.Infof(`%s: %s : elapsed %s`, t.msg, m, el.String())
}

func (t *Timer) Close() {
	el := time.Now().Sub(t.start)
	glog.Infof("%s: Elapsed time %s", t.msg, el.String())
}
