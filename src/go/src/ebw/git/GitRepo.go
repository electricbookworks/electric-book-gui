package git

import (
	// "github.com/golang/glog"
	"github.com/google/go-github/github"

	"ebw/util"
	"github.com/golang/glog"
)

type GitRepo struct {
	*github.Repository

	lastCommit *CommitInfo
}

//const DefaultFile = `_data/meta.yml`
const DefaultFile = `finger_protocol.py`

func (gr *GitRepo) GetLastCommit() *CommitInfo {
	gr.lastCommit.waiting.Wait()
	return gr.lastCommit
}

// FetchRepos fetches all the repositories for the client
func FetchRepos(client *Client) ([]*GitRepo, error) {
	repos, _, err := client.Repositories.List(client.Context, "",
		&github.RepositoryListOptions{
			ListOptions: github.ListOptions{
				PerPage: 500,
				Page:    1,
			},
			Direction:  `asc`,
			Sort:       `name`,
			Visibility: `all`,
		})

	if nil != err {
		return nil, util.Error(err)
	}
	grs := make([]*GitRepo, len(repos))
	for i, r := range repos {
		gr := &GitRepo{Repository: r}
		lc, err := LastCommit(client, gr.Owner.GetLogin(), gr.GetName())
		if nil == err {
			gr.lastCommit = lc
		}

		//rc, err := ContainsFile(client, gr)

		grs[i] = gr
	}
	return grs, nil
}

func ContainsFile(client *Client, gr *GitRepo) (*github.RepositoryContent, error) {
	rc, _, _, err := client.Repositories.GetContents(client.Context,
		gr.Owner.GetLogin(), gr.GetName(), DefaultFile, nil)

	if nil != err {
		glog.Errorf(`File named file(%s) not found: %s`, DefaultFile, err.Error())
		return nil, util.Error(err)
	}
	return rc, err
}
