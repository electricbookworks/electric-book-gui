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
	path               string `yaml:"-"`
	MergingDescription string `yaml:"merging_description"`
	MergingPRNumber    int    `yaml:"merging_pr_number"`
	// MergingFiles is a list of the files that are in conflict / modified
	// when the merge occurs. Because EBW allows us to delete and commit a delete
	// on the server, the deleted file will not exist in either the repo, the
	// their files, or the index, so it's not possible for us to find out that the
	// file has been deleted and committed (although the file should still exist in
	// HEAD, we would have to work our way through the whole of HEAD looking for it).
	MergingFiles []string `yaml:"merging_files"`
	// LastPRHash contains the Hash of the commit used for the last PR
	// sent from this repo. This is used to determine whether new changes
	// have been made on the repo that the user could push upstream.
	LastPRHash string `yaml:"last_pr_hash"`
	// LastUpstreamMergeHash is the last hash on the upstream remote
	// with which the local has merged. We need this to determine two
	// things- whether we have new PR's to push -
	LastUpstreamMergeHash string `yaml:"last_upstream_merge_hash"`
}

const ebw_repo_status_filename = `status.yml`

// readEBWRepoStatus reads the EBWRepoStatus for this repo.
func (g *Git) readEBWRepoStatus() (*EBWRepoStatus, error) {
	var err error
	rs := &EBWRepoStatus{}
	rs, err = rs.Read(g.PathEBWConfig(ebw_repo_status_filename))
	if nil != err {
		return rs, g.Error(err)
	}
	return rs, nil
}

// transformEBWRepoStatus reads the EBWRepoStatus, makes a transformation,
// and writes the EBWRepoStatus if no errors are encountered.
func (g *Git) transformEBWRepoStatus(f func(*EBWRepoStatus) error) error {
	rs, err := g.readEBWRepoStatus()
	if nil != err {
		return err
	}
	if err = f(rs); nil != err {
		return err
	}
	return rs.Write()
}

// readEBWRepoStatus reads the repo status for the repo
func (r *Repo) readEBWRepoStatus() (*EBWRepoStatus, error) {
	var err error
	rs := &EBWRepoStatus{}
	rs, err = rs.Read(r.ConfigPath(ebw_repo_status_filename))
	if nil != err {
		return rs, r.Error(err)
	}
	return rs, nil
}

// Read reads the EBWRepoStatus from the path provided
func (rs *EBWRepoStatus) Read(path string) (*EBWRepoStatus, error) {
	if nil == rs {
		rs = &EBWRepoStatus{}
	}
	rs.path = path
	raw, err := ioutil.ReadFile(path)
	if nil != err {
		if os.IsNotExist(err) {
			return rs, nil
		}
		return nil, util.Error(err)
	}
	if err := yaml.Unmarshal(raw, rs); nil != err {
		return nil, util.Error(err)
	}
	rs.path = path
	return rs, nil
}

// ResetMerge resets all the merge information in the EBWRepoStatus struct
func (rs *EBWRepoStatus) ResetMerge() {
	rs.MergingDescription = ``
	rs.MergingFiles = []string{}
	rs.MergingPRNumber = 0
}

// ToYaml converts the EBWRepoStatus to a yaml description
func (rs *EBWRepoStatus) ToYaml() string {
	raw, err := yaml.Marshal(rs)
	if nil != err {
		return err.Error()
	}
	return string(raw)
}

// Write writes the EBWRepoStatus back to the file whence it was read.
func (rs *EBWRepoStatus) Write() error {
	os.MkdirAll(filepath.Dir(rs.path), 0755)
	raw, err := yaml.Marshal(rs)
	if nil != err {
		return err
	}
	if err := ioutil.WriteFile(rs.path, raw, 0644); nil != err {
		return err
	}
	return nil
}

// WriteEBWRepoStatus writes the status for the repo
func (r *Repo) writeEBWRepoStatus() error {
	if err := r.EBWRepoStatus.Write(); nil != err {
		return r.Error(err)
	}
	return nil
}
