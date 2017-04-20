package git

import (
	"github.com/golang/glog"
)

type RepoContent struct {
	containsFile bool
}

//const DefaultSearchFile = `_data/ebw.yml`
const DefaultSearchFile = `finger_protocol.py`

func ContainsFile(client *Client, gr *GitRepo) (*RepoContent, error) {
	rc := &RepoContent{}

	content, _, _, err := client.Repositories.GetContents(client.Context,
		gr.Owner.GetLogin(), gr.GetName(), DefaultSearchFile, nil)

	if nil != err {
		glog.Errorf(`File named file(%s) not found: %s`, DefaultSearchFile, err.Error())
	}

	if nil != content {
		rc.containsFile = true
	}
	return rc, nil
}