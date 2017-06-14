package git

import (
	"crypto/sha1"
	"io/ioutil"

	git2go "gopkg.in/libgit2/git2go.v25"

	"ebw/util"
)

type FileInfo struct {
	Path string
	Hash *git2go.Oid
}

func (f *FileInfo) String() string {
	return f.Hash.String()
}

func NewFileInfoFromPath(path string) (*FileInfo, error) {
	exists, err := util.FileExists(path)
	if nil != err {
		return nil, util.Error(err)
	}
	if !exists {
		return &FileInfo{
			Path: path,
			Hash: &git2go.Oid{},
		}, nil
	}

	raw, err := ioutil.ReadFile(path)
	if nil != err {
		return nil, util.Error(err)
	}
	h := sha1.New()
	// `Write` expects bytes. If you have a string `s`,
	// use `[]byte(s)` to coerce it to bytes.
	h.Write(raw)
	oid := git2go.NewOidFromBytes(h.Sum(nil))
	return &FileInfo{
		Path: path,
		Hash: oid,
	}, nil
}
