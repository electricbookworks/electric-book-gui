package www

import (
	"encoding/json"
	"os"
	// "net/http"

	"github.com/google/go-github/github"

	"ebw/git"
)

func repoList(c *Context) error {
	client := GithubClient(c.W, c.R)
	if nil == client {
		// GithubClient will have redirected us
		return nil
	}
	repos, _, err := client.Repositories.List(c.R.Context(), "", &github.RepositoryListOptions{
		ListOptions: github.ListOptions{
			PerPage: 500,
		},
		Visibility: `all`,
	})
	if nil != err {
		return err
	}

	user, err := git.Username(c.R.Context(), client)
	if nil != err {
		return err
	}

	return c.Render("repo_list.html", map[string]interface{}{
		"Repos":    repos,
		"UserName": user,
	})
}

func repoView(c *Context) error {
	var err error
	client := GithubClient(c.W, c.R)
	if nil == client {
		// GithubClient will have redirected us
		return nil
	}

	repo := c.Vars[`repo`]
	user, err := git.Username(c.R.Context(), client)
	if nil != err {
		return err
	}

	c.D[`UserName`] = user
	c.D[`RepoName`] = repo
	c.D[`Path`], err = git.RepoDir(user, repo)
	if nil != err {
		return err
	}

	return c.Render(`repo_view.html`, nil)
}

func repoUpdate(c *Context) error {
	client := GithubClient(c.W, c.R)
	if nil == client {
		return nil
	}
	repo := c.Vars[`repo`]
	user, err := git.Username(c.R.Context(), client)
	if nil != err {
		return err
	}
	url := c.P(`url`)
	if _, err = git.Checkout(client, user, repo, url); nil != err {
		return err
	}

	// redirect the user to repoView
	return c.Redirect(`/repo/%s`, repo)
}

func pullRequestClose(c *Context) error {
	client := GithubClient(c.W, c.R)
	if nil == client {
		return nil
	}
	repo := c.Vars[`repo`]
	user, err := git.Username(c.R.Context(), client)
	if nil != err {
		return err
	}
	number := int(c.PI(`number`))
	if err := git.PullRequestClose(c.R.Context(), client, user, repo, number); nil != err {
		return err
	}
	return c.Redirect(`/repo/%s`, repo)
}

func pullRequestView(c *Context) error {
	client := GithubClient(c.W, c.R)
	if nil == client {
		return nil
	}
	repo := c.Vars[`repo`]
	user, err := git.Username(c.R.Context(), client)
	if nil != err {
		return err
	}

	c.D[`UserName`] = user
	c.D[`RepoName`] = repo
	pr, err := git.GetPullRequest(c.R.Context(), client, user, repo, int(c.PI(`number`)))
	if nil != err {
		return err
	}
	c.D[`PullRequest`] = pr
	if nil != err {
		return err
	}

	// Need to checkout both the repo and the PR
	if _, err = git.Checkout(client, user, repo, ``); nil != err {
		return err
	}
	js := json.NewEncoder(os.Stdout)
	js.SetIndent(``, `  `)
	js.Encode(pr)
	if _, err = git.PullRequestCheckout(*pr.Head.Repo.CloneURL, *pr.Head.SHA); nil != err {
		return err
	}

	diffs, err := git.PullRequestDiffList(c.R.Context(), client, user, repo, *pr.Head.SHA, `^book/text/.*`)
	if nil != err {
		return err
	}
	c.D[`Diffs`] = diffs
	c.D[`SHA`] = *pr.Head.SHA
	c.D[`PullURL`] = *pr.Head.Repo.CloneURL

	return c.Render(`pull_request_view.html`, nil)
}

func pullRequestCreate(c *Context) error {
	client := GithubClient(c.W, c.R)
	if nil == client {
		return nil
	}
	repo := c.Vars[`repo`]
	user, err := git.Username(c.R.Context(), client)
	if nil != err {
		return err
	}

	c.D[`UserName`] = user
	c.D[`RepoName`] = repo

	if `POST` == c.R.Method {
		if err := git.PullRequestCreate(c.R.Context(),
			client, user, repo,
			c.P(`title`), c.P(`notes`)); nil != err {
			return err
		}
		c.Redirect(`/repo/%s`, repo)
		return nil
	}

	return c.Render(`pull_new.html`, nil)
}
