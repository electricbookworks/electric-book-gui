package www

import (
	"encoding/json"
	"net/http"
	"os"
	"path/filepath"
	// "net/http"

	"github.com/golang/glog"
	// "github.com/google/go-github/github"

	"ebw/book"
	"ebw/config"
	"ebw/git"
	"ebw/util"
)

func repoCommit(c *Context) error {
	client := Client(c.W, c.R)
	if nil == client {
		return nil
	}

	repoOwner := c.Vars[`repoOwner`]
	repoName := c.Vars[`repoName`]

	repoDir, err := git.RepoDir(client.Username, repoOwner, repoName)
	if nil != err {
		return err
	}

	r, err := c.Repo()
	if nil != err {
		return err
	}

	if `POST` == c.R.Method {
		// Process a POST for a Commit
		msg := c.P(`commit_message`)
		if `` == msg {
			c.FlashError(`Enter a Commit Message`, `Please enter a commit message to describe the changes you're committing.`, nil)
			return c.Redirect(`/repo/%s/%s/commit`, repoOwner, repoName)
		}
		oid, err := git.Commit(client, repoOwner, repoName, msg)
		if nil != err {
			return err
		}
		c.FlashSuccess(`Commit Succeeded`, `Your commit succeeded with ID {{.Oid}}`, map[string]interface{}{`Oid`: oid.String()})
		return c.Redirect(pathRepoDetail(r))
	}

	c.D[`UserName`] = client.Username
	c.D[`RepoOwner`] = repoOwner
	c.D[`RepoName`] = repoName
	c.D[`Path`] = repoDir

	statusList, err := git.GitStatusList(c.Context(), repoDir)
	if nil != err {
		return err
	}
	c.D[`StatusList`] = statusList

	return c.Render(`repo_commit.html`, nil)
}

func repoList(c *Context) error {
	client := Client(c.W, c.R)
	if nil == client {
		return nil
	}

	repos, err := git.FetchRepos(client, int(c.PI(`pg`)), int(c.PI(`pp`)))
	if nil != err {
		return err
	}

	return c.Render("repo_list.html", map[string]interface{}{
		"Repos":    repos,
		"UserName": client.Username,
	})
}

func repoView(c *Context) error {
	var err error
	client := Client(c.W, c.R)
	if nil == client {
		// GithubClient will have redirected us
		return nil
	}

	repoOwner := c.Vars[`repoOwner`]
	repoName := c.Vars[`repoName`]

	c.D[`UserName`] = client.Username
	c.D[`RepoOwner`] = repoOwner
	c.D[`RepoName`] = repoName
	repoDir, err := git.RepoDir(client.Username, repoOwner, repoName)
	if nil != err {
		return err
	}
	c.D[`Path`] = repoDir
	c.D[`RepoFiles`], err = git.ListAllRepoFiles(client, client.Username, repoOwner, repoName)
	if nil != err {
		return err
	}

	proseConfig, err := book.ReadProse(repoDir)
	if nil != err {
		return err
	}
	c.D[`ProseIgnoreFilter`] = proseConfig.IgnoreFilterJS()

	return c.Render(`repo_view.html`, nil)
}

func repoDetails(c *Context) error {
	client := Client(c.W, c.R)
	if nil == client {
		return nil
	}
	repoOwner := c.Vars[`repoOwner`]
	repoName := c.Vars[`repoName`]

	repo, _, err := client.Repositories.Get(c.Context(), repoOwner, repoName)
	if nil != err {
		return err
	}

	prs, err := git.ListPullRequests(client, repoOwner, repoName)
	if nil != err {
		return err
	}
	c.D[`PullRequests`] = prs
	c.D[`PrCount`] = len(prs)

	var aheadBehind *git.RepoDiffStats

	if nil != repo.Parent {
		aheadBehind, err = git.CompareCommits(client,
			repo.GetName(),
			repo.Owner.GetLogin(),
			`master`,
			repo.Parent.Owner.GetLogin(),
			`master`,
		)
		if nil != err {
			return util.Error(err)
		}
	}

	erepo, err := git.NewRepo(client, repoOwner, repoName)
	if nil != err {
		return err
	}
	defer erepo.Free()

	stagedFiles, err := erepo.StagedFiles()
	if nil != err {
		return err
	}

	c.D[`ERepo`] = erepo
	c.D[`StagedFiles`] = stagedFiles

	c.D[`AheadBehind`] = aheadBehind

	c.D[`UserName`] = client.Username
	c.D[`RepoOwner`] = repoOwner
	c.D[`RepoName`] = repoName
	c.D[`RepoFiles`], err = git.ListAllRepoFiles(client, client.Username, repoOwner, repoName)
	if nil != err {
		return err
	}
	return c.Render(`repo_detail.html`, map[string]interface{}{
		"Repo": repo,
	})
}

func repoUpdate(c *Context) error {
	client := Client(c.W, c.R)
	if nil == client {
		return nil
	}
	repoOwner := c.Vars[`repoOwner`]
	repoName := c.Vars[`repoName`]

	url := c.P(`url`)
	if _, err := git.Checkout(client, repoOwner, repoName, url); nil != err {
		return err
	}

	// redirect the user to repoView
	return c.Redirect(`/repo/%s/%s/detail`, repoOwner, repoName)
}

func pullRequestClose(c *Context) error {
	client := Client(c.W, c.R)
	if nil == client {
		return nil
	}
	repoOwner := c.Vars[`repoOwner`]
	repoName := c.Vars[`repoName`]

	number := int(c.PI(`number`))
	if err := git.PullRequestClose(client, client.Username, repoOwner, repoName, number); nil != err {
		return err
	}
	return c.Redirect(`/repo/%s/%s/`, repoOwner, repoName)
}

// pullRequestList shows a list of all the open (and perhaps closed)
// PR's for a repo.
func pullRequestList(c *Context) error {
	client := Client(c.W, c.R)
	if nil == client {
		return nil
	}
	repoOwner := c.Vars[`repoOwner`]
	repoName := c.Vars[`repoName`]

	pullRequests, err := git.ListPullRequests(client, repoOwner, repoName)
	if nil != err {
		return err
	}

	c.D[`UserName`] = client.Username
	c.D[`RepoOwner`] = repoOwner
	c.D[`RepoName`] = repoName

	c.D[`PullRequests`] = pullRequests

	return c.Render(`pull_request_list.html`, nil)
}

func pullRequestView(c *Context) error {
	client := Client(c.W, c.R)
	if nil == client {
		return nil
	}
	repoOwner := c.Vars[`repoOwner`]
	repoName := c.Vars[`repoName`]

	c.D[`UserName`] = client.Username
	c.D[`RepoOwner`] = repoOwner
	c.D[`RepoName`] = repoName

	pullRequestNumber := int(c.PI(`number`))

	pr, err := git.GetPullRequest(client, client.Username, repoOwner, repoName, pullRequestNumber)
	if nil != err {
		return err
	}
	c.D[`PullRequest`] = pr
	if nil != err {
		return err
	}

	// Need to checkout both the repo and the PR
	if _, err = git.Checkout(client, repoOwner, repoName, ``); nil != err {
		return err
	}
	js := json.NewEncoder(os.Stdout)
	js.SetIndent(``, `  `)
	js.Encode(pr)
	if _, err = git.PullRequestCheckout(client, *pr.Head.Repo.CloneURL, *pr.Head.SHA); nil != err {
		return err
	}

	diffs, err := git.PullRequestDiffList(client, repoOwner, repoName, pr)
	if nil != err {
		return err
	}
	c.D[`Diffs`] = diffs
	c.D[`SHA`] = *pr.Head.SHA
	c.D[`PullURL`] = *pr.Head.Repo.CloneURL

	return c.Render(`pull_request_view.html`, nil)
}

func pullRequestCreate(c *Context) error {
	client := Client(c.W, c.R)
	if nil == client {
		return nil
	}
	repoOwner := c.Vars[`repoOwner`]
	repoName := c.Vars[`repoName`]

	c.D[`UserName`] = client.Username
	c.D[`RepoOwner`] = repoOwner
	c.D[`RepoName`] = repoName

	if `POST` == c.R.Method {
		if err := git.PullRequestCreate(
			client, client.Username, repoOwner, repoName,
			c.P(`title`), c.P(`notes`)); nil != err {
			return err
		}
		c.Redirect(`/repo/%s/%s/`, repoOwner, repoName)
		return nil
	}

	return c.Render(`pull_new.html`, nil)
}

// repoFileServer serves files from the current user's repos.
func repoFileServer(c *Context) error {
	client := Client(c.W, c.R)
	if nil == client {
		return nil
	}

	root, err := os.Getwd()
	if nil != err {
		return util.Error(err)
	}
	root = filepath.Join(root, config.Config.GitCache, `repos`, client.Username)
	glog.Infof(`Serving %s from %s`, c.R.RequestURI, root)
	fs := http.StripPrefix(`/www/`, http.FileServer(http.Dir(root)))
	fs.ServeHTTP(c.W, c.R)
	return nil
}

func repoMergeUpstream(c *Context) error {
	client := Client(c.W, c.R)
	if nil == client {
		return nil
	}

	repoOwner := c.Vars[`repoOwner`]
	repoName := c.Vars[`repoName`]

	remote, err := git.FetchRemoteForRepo(client, repoOwner, repoName, `origin`)
	if nil != err {
		return err
	}
	remote.Free()

	return nil

}

// repoPushRemote pushes to the remote repo. For our purposes
// this would almost always be origin/master
func repoPushRemote(c *Context) error {
	repo, err := c.Repo()
	if nil != err {
		return err
	}
	if err := repo.Push(c.Vars[`remote`], c.Vars[`branch`]); nil != err {
		return err
	}
	return c.Redirect(pathRepoDetail(repo))
}

func repoMergeRemoteBranch(c *Context) error {
	var settings struct {
		Resolve    string `schema:"resolve"`
		Conflicted bool   `schema:"conflicted"`
	}
	if err := c.Decode(&settings); nil != err {
		return err
	}

	repo, err := c.Repo()
	if nil != err {
		return err
	}
	if err := repo.Pull(c.Vars[`remote`], c.Vars[`branch`]); nil != err {
		return err
	}
	switch settings.Resolve {
	case `our`:
		if err := repo.ResetConflictedFilesInWorkingDir(true, settings.Conflicted, nil); nil != err {
			return err
		}
	case `their`:
		if err := repo.ResetConflictedFilesInWorkingDir(false, settings.Conflicted, nil); nil != err {
			return err
		}
	}
	return c.Redirect(pathRepoConflict(repo))
}
