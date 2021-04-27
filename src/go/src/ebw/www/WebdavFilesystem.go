package www

import (
	`context`
	"os"
	"path/filepath"

	"github.com/golang/glog"
	"golang.org/x/net/webdav"
)

var _ = glog.Infof

type OSFileSystem struct {
	root string
}

func NewOSFileSystem(root string) *OSFileSystem {
	root = filepath.Join(`webdav`, root)
	os.MkdirAll(root, 0755)
	return &OSFileSystem{root}
}

// resolve converts from a webdav path to a filesystem path
func (o *OSFileSystem) resolve(name string) string {
	return filepath.Join(o.root, name)
}

func (o *OSFileSystem) Mkdir(ctx context.Context, name string, perm os.FileMode) error {
	return os.Mkdir(o.resolve(name), perm)
}

func (o *OSFileSystem) OpenFile(ctx context.Context, name string, flag int, perm os.FileMode) (webdav.File, error) {
	return os.OpenFile(o.resolve(name), flag, perm)
}

func (o *OSFileSystem) RemoveAll(ctx context.Context, name string) error {
	return os.RemoveAll(o.resolve(name))
}

func (o *OSFileSystem) Rename(ctx context.Context, oldName, newName string) error {
	return os.Rename(o.resolve(oldName), o.resolve(newName))
}

func (o *OSFileSystem) Stat(ctx context.Context, name string) (os.FileInfo, error) {
	return os.Stat(o.resolve(name))
}
