package git

import (
	"github.com/golang/glog"
	"reflect"
)

const DefaultSearchFile = `_data/meta.yml`

func ContainsFile(client *Client, gr *GitRepo) (bool, error) {
	content, _, _, err := client.Repositories.GetContents(client.Context,
		gr.Owner.GetLogin(), gr.GetName(), DefaultSearchFile, nil)

	if nil != err {
		glog.Infof(`File named file(%s) not found: %s (%s)`, DefaultSearchFile, err.Error(),
			reflect.TypeOf(err).Name())

	}
	return nil != content, nil

}
