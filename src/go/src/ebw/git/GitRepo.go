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

func (prs *PullRequestInfo) GetTotalPRs() int {
	prs.waiting.Wait()
	return prs.PRCount
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

		rc, err := ContainsFile(client, gr)

		if nil != err {
			return nil, util.Error(err)
		}

		//only add to list and fetch last commits and if the repo already contains the file
		if rc.containsFile {
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
	}

	return RemoveEmpty(grs), nil
}

func RemoveEmpty(s []*GitRepo) []*GitRepo {
	var r []*GitRepo
	for _, repo := range s {
		if repo != nil {
			r = append(r, repo)
		}
	}
	return r
}

