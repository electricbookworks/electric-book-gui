package git

import (
	// "github.com/golang/glog"
	"github.com/google/go-github/github"

	"ebw/util"
)

type GitRepo struct {
	*github.Repository

	lastCommit *CommitInfo
}

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
		grs[i] = gr
	}
	return grs, nil
}
