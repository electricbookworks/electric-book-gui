package git

import (
	"io/ioutil"
	"os"
	"path/filepath"

	"gopkg.in/yaml.v2"

	"ebw/util"
)

type EBWRepoStatus struct {
	MergingPRNumber int `yaml:"merging_pr_number"`
}

// ReadEBWRepoStatus reads the repo status for the repo
func (r *Repo) ReadEBWRepoStatus() (*EBWRepoStatus, error) {
	rs := &EBWRepoStatus{}
	raw, err := ioutil.ReadFile(r.ConfigPath(`status.yml`))
	if nil != err {
		if os.IsNotExist(err) {
			return rs, nil
		}
		return nil, util.Error(err)
	}
	if err := yaml.Unmarshal(raw, rs); nil != err {
		return nil, util.Error(err)
	}
	return rs, nil
}

// WriteEBWRepoStatus writes the status for the repo
func (r *Repo) WriteEBWRepoStatus() error {
	rs := r.EBWRepoStatus
	path := r.ConfigPath(`status.yml`)
	os.MkdirAll(filepath.Dir(path), 0755)
	raw, err := yaml.Marshal(rs)
	if nil != err {
		return util.Error(err)
	}
	if err := ioutil.WriteFile(path, raw, 0644); nil != err {
		return util.Error(err)
	}
	return nil
}
