package git

import (
	// "encoding/json"
	// "os"
	"testing"
)

func TestDirectoryEntry(t *testing.T) {
	_, err := NewDirectory(`/home/craig/proj/ebw/electric-book-gui/src/go/src/ebw`)
	if nil != err {
		t.Fatal(err)
	}
}
