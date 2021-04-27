package git

import (
	"errors"
	"os"
	"io/ioutil"
	"path/filepath"
	"time"

	"github.com/golang/glog"
	git2go "github.com/libgit2/git2go/v31"

	"ebw/util"
)

// File is a file in a git repo, either in a WorkingTree or in a commit (eg HEAD), etc.
type FileData struct {
	Version string
	Path string
	Exists bool
	Data string
	Hash string
}

func (g *Git) ReadFileData(path string, v GitFileVersion) (*FileData, error) {
	f := &FileData{
		Version: v.String(),
		Path: path,
	}
	if filepath.Base(path)==`sleep.md` {
		time.Sleep(4 * time.Second)
	}
	switch v {
	case GFV_OUR_HEAD:

		head, err := g.Repository.Head()
		if nil!=err {
			return nil, g.Error(err)
		}
		defer head.Free()
			tree, err := head.Peel(git2go.ObjectTree)
			if nil != err {
				return nil, g.Error(err)
			}
			defer tree.Free()

			raw, oid, err := g.readPathForTreeObjectWithHash(tree, path)
		if nil!=err {
			if git2go.IsErrorCode(err, git2go.ErrNotFound) {
				return f, nil
			}
			return nil, g.Error(err)
		}
		f.Exists, f.Data, f.Hash = true, string(raw), oid.String()
		return f, nil
	case GFV_OUR_WD:
		p := g.Path(path)		
		_, err := os.Stat(p)
		if os.IsNotExist(err) {
			return f, nil			
		}
		if nil!=err {
			return nil, g.Error(err)
		}
		raw, err := ioutil.ReadFile(p)
		if nil!=err {
			return nil, g.Error(err)
		}
		f.Exists, f.Data, f.Hash = true, string(raw), *util.CalcSHA(raw)
		glog.Infof(`Read file %s: %s`, f.Path, f.Data)
		return f, nil
	default:
		return nil, g.Error(errors.New(`Git.ReadFile only supports GitFileVersion GFV_OUR_HEAD and GFV_OUR_WD`))
	}
}