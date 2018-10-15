package git

import (
	"reflect"
	"sort"
	"sync"

	"github.com/golang/glog"
	"github.com/google/go-github/github"
	"github.com/juju/errors"

	"ebw/util"
)

type GitRepo struct {
	*github.Repository

	lastCommit *CommitInfo
	totalPRs   *PullRequestInfo
}

// CanPush returns true if this user can push to the repo, or false otherwise
func (g *GitRepo) CanPush() bool {
	return g.Repository.GetPermissions()[`push`]
}

// GetRepoOwner returns the github username of the
// owner of the repo.
func (g *GitRepo) RepoOwner() string {
	return g.Owner.GetLogin()
}

// RepoOwnerNiceName returns the users name or login if the
// name isn't available.
func (g *GitRepo) RepoOwnerNiceName() string {
	name := g.Owner.GetName()
	if `` == name {
		return g.Owner.GetLogin()
	}
	return name
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

	repos := []*github.Repository{}
	opts := &github.RepositoryListOptions{
		Affiliation: `owner,collaborator,organization_member`,
		Direction:   `asc`,
		// https://godoc.org/github.com/google/go-github/github#RepositoryListOptions
		// suggests valid values are created, updated, pushed,
		// full_name. Default: full_name
		Sort:       `full_name`,
		Visibility: `all`,
	}
	if err := GithubPaginate(&opts.ListOptions, func() (*github.Response, error) {
		r, res, err := client.Repositories.List(client.Context, "", opts)
		if nil != err {
			return nil, util.Error(err)
		}

		repos = append(repos, r...)
		return res, err
	}); nil != err {
		return nil, err
	}

	var reloadRepo sync.WaitGroup
	// Loading each repo in serial could take a while, so we launch multiple goroutines to 
	// do it in
	// parallel
	var ERR = make(chan error, len(repos))
	for i := 0; i < len(repos); i++ {
		repo := repos[i]
		if repo.GetFork() && nil == repo.Parent {
			reloadRepo.Add(1)
			go func(ID, i int) {
				defer reloadRepo.Done()
				repo, _, ierr := client.Repositories.GetByID(client.Context, ID)
				if nil != ierr {
					githubE, ok := ierr.(*github.ErrorResponse)
					if !ok {
						glog.Errorf(`ENCOUNTERED ERROR %s: %s`, reflect.ValueOf(ierr).Elem().Type().String(), ierr.Error())
						ERR <- errors.Annotatef(ierr, "FAILED to retrieve repo %d", ID)
						return						
					}
					if 404==githubE.Response.StatusCode {
						// THE REPO HAS DISAPPEARED, but we won't crash because
						// it's not here
						repos[i] = nil						
						return
					}
					glog.Errorf(`githubE Response StatusCode = %d`, githubE.Response.StatusCode)
					ERR <-errors.Annotatef(ierr, "FAILED to retrieve repo %d", ID)
					return
				}
				repos[i] = repo
			}(repo.GetID(), i)
		}
	}
	reloadRepo.Wait()
	close(ERR)
	for err := range ERR {
		if nil!=err {
			return nil, util.Error(err)
		}
	}

	// REMOVE all nil repos
	tempRepos := make([]*github.Repository, 0, len(repos))
	for _, r := range repos {
		if nil!=r {
			tempRepos = append(tempRepos, r)
		}
	}
	repos = tempRepos

	C := make(chan *GitRepo)
	var waitForFileChecks sync.WaitGroup
	waitForFileChecks.Add(len(repos))

	ERR = make(chan error, len(repos))
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

			// only add to list and fetch last commits and if the repo
			// already contains the file
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

