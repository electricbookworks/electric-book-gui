package git

import (
	"encoding/json"
	"os"
	"testing"
)

func TestDirectoryEntry(t *testing.T) {
	d, err := NewDirectory(`/home/craig/proj/ebw/electric-book-gui/src/go/src/ebw`)
	if nil != err {
		t.Fatal(err)
	}
	js := json.NewEncoder(os.Stderr)
	js.Encode(d)
	t.Fatal(`end`)
}
