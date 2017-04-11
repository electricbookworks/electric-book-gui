package www

import (
	"encoding/json"
	"net/http"
	"os"
	"path/filepath"
	// "net/http"

	"github.com/golang/glog"
	"github.com/google/go-github/github"

	"ebw/config"
	"ebw/git"
	"ebw/util"
)

type  CommitInfo struct {
	LastModified string
	Committer    string
}

func landingHandler(c *Context) error {
	return c.Render("landing.html", map[string]interface{}{})
}

func fetchRepos(c *Context) []*github.Repository {
	client := Client(c.W, c.R)
	if nil == client {
		return nil
	}

	repos, _, err := client.Repositories.List(client.Context, "",
		&github.RepositoryListOptions{
			ListOptions: github.ListOptions{
				PerPage: 500,
				Page:    1,
			},
			Direction:`desc`,
			Sort: `name`,
			Visibility: `all`,
		})

	if nil != err {
		glog.Infof(`No repositories found`)
	}
	return repos
}

func repoList(c *Context) error {
	client := Client(c.W, c.R)
	if nil == client {
		return nil
	}
	return c.Render("repo_list.html", map[string]interface{}{
		"Repos":    fetchRepos(c),
		"UserName": client.Username,
	})
}

func searchRepoList(c *Context) error {
	client := Client(c.W, c.R)
	if nil == client {
		return nil
	}
	repos := fetchRepos(c)

	var repoList []*github.Repository

	for i := 0; i < len(repos); i++ {

		var data map[string]interface{}

		result, _ := json.Marshal(repos[i])
		json.Unmarshal([]byte(result), &data)

		repoContent, _, _, err := client.Repositories.GetContents(client.Context,
			client.Username, data[`name`].(string), c.P(`file_name`), nil)

		if repoContent != nil {
			repoList = append(repoList, repos[i])
		}

		if nil != err {
			glog.Infof(`No repository content found `)
		}

	}

	return c.Render("repo_list.html", map[string]interface{}{
		"Repos":    repoList,
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

	repo := c.Vars[`repo`]

	c.D[`UserName`] = client.Username
	c.D[`RepoName`] = repo
	c.D[`Path`], err = git.RepoDir(client.Username, repo)
	if nil != err {
		return err
	}

	return c.Render(`repo_view.html`, nil)
}

func repoUpdate(c *Context) error {
	client := Client(c.W, c.R)
	if nil == client {
		return nil
	}
	repo := c.Vars[`repo`]

	url := c.P(`url`)
	if _, err := git.Checkout(client, client.Username, repo, url); nil != err {
		return err
	}

	// redirect the user to repoView
	return c.Redirect(`/repo/%s`, repo)
}

func pullRequestClose(c *Context) error {
	client := Client(c.W, c.R)
	if nil == client {
		return nil
	}
	repo := c.Vars[`repo`]

	number := int(c.PI(`number`))
	if err := git.PullRequestClose(client, client.Username, repo, number); nil != err {
		return err
	}
	return c.Redirect(`/repo/%s`, repo)
}

func pullRequestView(c *Context) error {
	client := Client(c.W, c.R)
	if nil == client {
		return nil
	}
	repo := c.Vars[`repo`]

	c.D[`UserName`] = client.Username
	c.D[`RepoName`] = repo
	pr, err := git.GetPullRequest(client, client.Username, repo, int(c.PI(`number`)))
	if nil != err {
		return err
	}
	c.D[`PullRequest`] = pr
	if nil != err {
		return err
	}

	// Need to checkout both the repo and the PR
	if _, err = git.Checkout(client, client.Username, repo, ``); nil != err {
		return err
	}
	js := json.NewEncoder(os.Stdout)
	js.SetIndent(``, `  `)
	js.Encode(pr)
	if _, err = git.PullRequestCheckout(*pr.Head.Repo.CloneURL, *pr.Head.SHA); nil != err {
		return err
	}

	diffs, err := git.PullRequestDiffList(client, client.Username, repo, *pr.Head.SHA, `^book/text/.*`)
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
	repo := c.Vars[`repo`]

	c.D[`UserName`] = client.Username
	c.D[`RepoName`] = repo

	if `POST` == c.R.Method {
		if err := git.PullRequestCreate(
			client, client.Username, repo,
			c.P(`title`), c.P(`notes`)); nil != err {
			return err
		}
		c.Redirect(`/repo/%s`, repo)
		return nil
	}

	return c.Render(`pull_new.html`, nil)
}

// repoFileServer serves files from the current user's repos.
func repoFileServer(c *Context) error {
	client := Client(c.W, c.R)

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
