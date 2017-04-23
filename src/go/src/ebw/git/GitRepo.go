package git

import (
	"sort"
	"sync"

	// "github.com/golang/glog"
	"github.com/google/go-github/github"

	"ebw/util"
)

type GitRepo struct {
	*github.Repository

	lastCommit *CommitInfo
	totalPRs   *PullRequestInfo
}

// GetRepoOwner returns the github username of the
// owner of the repo.
func (g *GitRepo) RepoOwner() string {
	return g.Owner.GetLogin()
}

type gitRepoSlice []*GitRepo

func (g gitRepoSlice) Len() int {
	return len(g)
}
func (g gitRepoSlice) Swap(i, j int) {
	g[i], g[j] = g[j], g[i]
}
func (g gitRepoSlice) Less(i, j int) bool {
	in, jn := g[i].GetName(), g[j].GetName()
	if in == jn {
		return g[i].Owner.GetLogin() < g[j].Owner.GetLogin()
	}
	return in < jn
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

	C := make(chan *GitRepo)
	var waitForFileChecks sync.WaitGroup
	waitForFileChecks.Add(len(repos))

	ERR := make(chan error, len(repos))
	go func() {
		waitForFileChecks.Wait()
		close(C)
		close(ERR)
	}()

	for _, r := range repos {
		go func(r *github.Repository) {
			defer waitForFileChecks.Done()
			gr := &GitRepo{Repository: r}

			containsFile, err := ContainsFile(client, gr)
			if nil != err {
				ERR <- err
				return
			}

			//only add to list and fetch last commits and if the repo already contains the file
			if containsFile {
				lc, err := LastCommit(client, gr.Owner.GetLogin(), gr.GetName())
				if nil == err {
					gr.lastCommit = lc
				}
				prs, err := TotalPRs(client, gr.Owner.GetLogin(), gr.GetName())
				if nil == err {
					gr.totalPRs = prs
				}
				C <- gr
			}
			ERR <- nil
		}(r)
	}

	books := make([]*GitRepo, 0, len(repos))
	for book := range C {
		books = append(books, book)
	}
	// Books aren't guaranteed returned on the channel in the
	// order the go-routines were triggered, so we sort
	// the books.
	sort.Sort(gitRepoSlice(books))

	for err := range ERR {
		if nil != err {
			return nil, util.Error(err)
		}
	}
	return books, nil
}
