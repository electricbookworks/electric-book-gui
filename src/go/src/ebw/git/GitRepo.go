package git

import (
	// "github.com/golang/glog"
	"github.com/google/go-github/github"

	"ebw/util"
)

type GitRepo struct {
	*github.Repository

	lastCommit *CommitInfo
	totalPRs   *PullRequestInfo
}

func (gr *GitRepo) GetLastCommit() *CommitInfo {
	gr.lastCommit.waiting.Wait()
	return gr.lastCommit
}

func (gr *GitRepo) GetTotalPRs() int {
	gr.totalPRs.waiting.Wait()
	return gr.totalPRs.PRCount
}

// FetchRepos fetches all the repositories for the client
func FetchRepos(client *Client, page, perPage int) ([]*GitRepo, error) {
	if 0 == perPage {
		perPage = 100
	}

	repos, _, err := client.Repositories.List(client.Context, "",
		&github.RepositoryListOptions{
			ListOptions: github.ListOptions{
				PerPage: 5000,
				Page:    page,
			},
			Affiliation: `owner,collaborator,organization_member`,
			Direction:   `asc`,
			// is `name` valid here?
			// https://godoc.org/github.com/google/go-github/github#RepositoryListOptions
			// suggests valid values are created, updated, pushed,
			// full_name. Default: full_name
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
		prs, err := TotalPRs(client, gr.Owner.GetLogin(), gr.GetName())

		if nil == err {
			gr.totalPRs = prs
		}

		grs[i] = gr
	}
	return grs, nil

}
