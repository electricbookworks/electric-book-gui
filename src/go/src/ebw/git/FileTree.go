package git

import (
	"io/ioutil"
	"os"
	"path/filepath"

	"github.com/golang/glog"

	"ebw/util"
)

// FileTree is a model of a filetree that is stored on disk.
// The Path() method resolves relative paths into the tree,
// while the Temporary flag indicates whether the filetree
// will be removed on cleanup.
type FileTree struct {
	Path      func(path ...string) string
	Temporary bool
}

// Exists returns true if the given path exists on the FileTree
// or false otherwise.
func (ft *FileTree) Exists(path string) (bool, error) {
	return util.FileExists(ft.Path(path))
}

// Write writes the given data to the specified path on the
// FileTree. If data is nil, the file is deleted.
func (ft *FileTree) Write(path string, data []byte) error {
	if nil == data {
		return ft.Remove(path)
	}
	path = ft.Path(path)
	os.MkdirAll(filepath.Dir(path), 0755)
	if err := ioutil.WriteFile(path, data, 0644); nil != err {
		return util.Error(err)
	}
	return nil
}

// Read reads the given path from the FileTree
func (ft *FileTree) Read(path string) ([]byte, error) {
	path = ft.Path(path)
	raw, err := ioutil.ReadFile(path)
	if nil != err {
		return nil, util.Error(err)
	}
	return raw, nil
}

// Remove removes the given path from the FileTree
func (ft *FileTree) Remove(path string) error {
	err := os.Remove(ft.Path(path))
	if nil != err && !os.IsNotExist(err) {
		return util.Error(err)
	}
	return nil
}

// Cleanup performs any necessary cleanup on a FileTree
func (ft *FileTree) Cleanup() error {
	if ft.Temporary {
		if err := os.RemoveAll(ft.Path()); nil != err && !os.IsNotExist(err) {
			return util.Error(err)
		}
	}
	return nil
}

// Sync synchronizes a FileTree with a given version of a
// merging repo.
func (ft *FileTree) Sync(r *Repo, version FileVersion) error {
	glog.Infof(`RemoveAll`)
	os.RemoveAll(ft.Path())
	glog.Infof(`StagedFilesAbbreviated`)
	sf, err := r.StagedFilesAbbreviated()
	if nil != err {
		return err
	}
	for _, f := range sf {
		glog.Infof(`FileCat %s`, f.Path)
		exists, raw, err := r.FileCat(f.Path, version)
		if nil != err {
			return err
		}
		if !exists {
			glog.Infof(`Remove %s`, f.Path)
			err = ft.Remove(f.Path)
		} else {
			glog.Infof(`Write %s`, f.Path)
			err = ft.Write(f.Path, raw)
		}
		if nil != err {
			return err
		}
	}
	return nil
}
