package git

import (
	"encoding/json"
	"crypto/sha1"
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"
	"regexp"

	"github.com/golang/glog"
	
	"ebw/util"
)

type PullRequestDiff struct {
	Path       string `json:"path"`
	RemotePath string `json:"remote_path"`
	RemoteHash string `json:"remote_hash"`
	LocalPath  string `json:"local_path"`
	LocalHash  string `json:"local_hash"`

	Equal bool `json:"equal"`
}

func (prd *PullRequestDiff) String() string {
	r, err := json.Marshal(prd)
	if nil!=err {
		glog.Errorf(`Failed JSON marshal of %v: %s`, prd, err.Error())
		return err.Error()
	}
	return string(r)
}

// HashFile returns the hash of the file at fn
func HashFile(fn string) (string, error) {
	raw, err := ioutil.ReadFile(fn)
	if nil != err {
		return ``, util.Error(err)
	}
	return fmt.Sprintf("%x", sha1.Sum(raw)), nil
}

func GetPathDiffList(localPath, remotePath string, pathRegexp string) ([]*PullRequestDiff, error) {
	reg, err := regexp.Compile(pathRegexp)
	if nil != err {
		return nil, err
	}

	//glog.Infof(`GetPathDiffList: localPath = %s, remotePath = %s`, )

	diffs := []*PullRequestDiff{}
	locals := map[string]*PullRequestDiff{}

	err = filepath.Walk(localPath, func(fn string, fi os.FileInfo, err error) error {
		relFilename, err := filepath.Rel(localPath, fn)
		if nil != err {
			return err
		}
		if reg.MatchString(relFilename) {
			hash, err := HashFile(fn)
			if nil != err {
				return err
			}
			diff := &PullRequestDiff{
				Path:      relFilename,
				LocalPath: fn,
				LocalHash: hash,
				Equal:     false,
			}
			diffs = append(diffs, diff)
			locals[relFilename] = diff
		}
		return nil
	})

	err = filepath.Walk(remotePath, func(fn string, fi os.FileInfo, err error) error {
		relFilename, err := filepath.Rel(remotePath, fn)
		if nil != err {
			return err
		}
		if reg.MatchString(relFilename) {
			hash, err := HashFile(fn)
			if nil != err {
				return err
			}
			diff, ok := locals[relFilename]
			if !ok {

				diffs = append(diffs,
					&PullRequestDiff{
						Path:       relFilename,
						RemotePath: fn,
						RemoteHash: hash,
						Equal:      false,
					})
				return nil
			}
			diff.RemotePath = fn
			diff.RemoteHash = hash
			diff.Equal = hash == diff.LocalHash
		}
		return nil
	})
	unequal := []*PullRequestDiff{}
	for _, d := range diffs {
		if !d.Equal {
			unequal = append(unequal, d)
		}
	}
	return unequal, err
}
