package print

import (
	"sync"
)

// JekyllPorts handles assigning ports to Jekyll servers.
// We don't perform very complex checking on port availability,
// which could be done down the line, but for now simply assume
// that a port will be available across a sufficient range for
// our requirements.
type JekyllPorts struct {
	lock sync.Mutex
	port int64
	free []int64
}

func NewJekyllPorts() *JekyllPorts {
	return &JekyllPorts{port: 12345, free: []int64{}}
}

func (jp *JekyllPorts) Assign() int64 {
	jp.lock.Lock()
	defer jp.lock.Unlock()

	if 0 < len(jp.free) {
		port := jp.free[0]
		jp.free = jp.free[1:]
		return port
	}
	jp.port++
	return jp.port
}

func (jp *JekyllPorts) Release(p int64) {
	jp.lock.Lock()
	jp.free = append(jp.free, p)
	jp.lock.Unlock()
}
