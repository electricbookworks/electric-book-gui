package git

import (
	"io/ioutil"
	"os"
	"path/filepath"

	"gopkg.in/yaml.v2"

	"ebw/util"
)

// EBWRepoStatus constains information on the status of the repo
// that might not (?) be possible to retrieve from reading the actual
// repo directory. In particular, it describes, when a merge is in process,
// which (if any) PR is being merged, and the origin of the merge (e.g.
// merging a particular PR, or merging with Github, or merging with
// original book).
type EBWRepoStatus struct {
	MergingDescription string `yaml:"merging_description"`
	MergingPRNumber    int    `yaml:"merging_pr_number"`
	// MergingFiles is a list of the files that are in conflict / modified
	// when the merge occurs. Because EBW allows us to delete and commit a delete
	// on the server, the deleted file will not exist in either the repo, the
	// their files, or the index, so it's not possible for us to find out that the
	// file has been deleted and committed (although the file should still exist in
	// HEAD, we would have to work our way through the whole of HEAD looking for it).
	MergingFiles []string `yaml:"merging_files"`
}

const ebw_repo_status_filename = `status.yml`

// readEBWRepoStatus reads the repo status for the repo
func (r *Repo) readEBWRepoStatus() (*EBWRepoStatus, error) {
	rs := &EBWRepoStatus{}
	raw, err := ioutil.ReadFile(r.ConfigPath(ebw_repo_status_filename))
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
func (r *Repo) writeEBWRepoStatus() error {
	rs := r.EBWRepoStatus
	path := r.ConfigPath(ebw_repo_status_filename)
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
