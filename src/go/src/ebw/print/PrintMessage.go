package print

import (
	"bufio"
	"fmt"
	"io"
)

type PrintMessage struct {
	Event string
	Data  interface{}
}

func PrintMessageLog(strfmt string, args ...interface{}) PrintMessage {
	return PrintMessage{
		Event: `log`,
		Data:  fmt.Sprintf(strfmt, args...),
	}
}

// PrintLogWriter returns a Writer which will channel all writes
// across the given PrintMessage channel as log messages of the given
// level.
func PrintLogWriter(C chan PrintMessage, level string) io.WriteCloser {
	in, out := io.Pipe()
	go func() {
		read := bufio.NewScanner(in)
		for read.Scan() {
			C <- PrintMessage{
				Event: `log`,
				Data: map[string]string{
					`level`: level,
					`log`:   read.Text(),
				},
			}
		}
	}()
	return out
}
