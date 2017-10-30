package print

import (
	"bufio"
	"io"
	"sync"
)

type Line struct {
	Level string
	Line  string
}

type OutErrMerge struct {
	Out io.WriteCloser
	Err io.WriteCloser

	lines []*Line
	lock  sync.Mutex
}

func NewOutErrMerge() *OutErrMerge {
	readOut, out := io.Pipe()
	readErr, err := io.Pipe()

	oem := &OutErrMerge{
		Out:   out,
		Err:   err,
		lines: []*Line{},
	}
	go oem.Scan(readOut, `out`)
	go oem.Scan(readErr, `err`)
	return oem
}

func (oem *OutErrMerge) Scan(in io.ReadCloser, lvl string) {
	s := bufio.NewScanner(in)
	for s.Scan() {
		oem.lock.Lock()
		oem.lines = append(oem.lines, &Line{Level: lvl, Line: s.Text()})
		oem.lock.Unlock()
	}
}

func (oem *OutErrMerge) Lines() []*Line {
	oem.lock.Lock()
	l := make([]*Line, len(oem.lines))
	for i, lp := range oem.lines {
		l[i] = lp
	}
	oem.lock.Unlock()
	return l
}
