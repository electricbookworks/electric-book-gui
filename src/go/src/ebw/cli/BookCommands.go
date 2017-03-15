package cli

import (
	"context"
	"errors"
	"flag"
	"os"
	"path/filepath"
	"strings"

	"github.com/craigmj/commander"
	"github.com/google/go-github/github"

	"ebw/cli/config"
	"ebw/git"
	"ebw/util"
)

func BookCommands() *commander.Command {
	return commander.NewCommand(`book`,
		`book related commands`,
		nil,
		func(args []string) error {
			return commander.Execute(args,
				BookNewCommand,
				BookContributeCommand,
				BookCloneCommand,
				BookCreatePullRequestCommand,
			)
		})
}

func BookNewCommand() *commander.Command {
	fs := flag.NewFlagSet(`new`, flag.ExitOnError)
	template := fs.String(`template`, `electricbookworks/electric-book`, `Book generation template`)

	return commander.NewCommand(`new`,
		`Create a new book with the given name`,
		nil,
		func(args []string) error {
			if 1 != len(args) {
				return errors.New(`book new requires 1 parameter, the name of the new book repo`)
			}

			return BookNew(*template, args[0])
		})
}

func BookContribute(cntxt context.Context, repo string) error {
	client, err := config.Config.GithubClient()
	if nil != err {
		return err
	}
	parts := strings.Split(repo, `/`)
	if 2 != len(parts) {
		return errors.New(`repo should be user/repo format`)
	}
	_, _, err = client.Repositories.CreateFork(
		cntxt,
		parts[0],
		parts[1],
		&github.RepositoryCreateForkOptions{})
	if nil != err {
		return err
	}
	// Then checkout the repo to our wd
	user, err := config.Config.GetUser()
	if nil != err {
		return util.Error(err)
	}

	return git.GitCloneTo(cntxt, client, "", /* empty working dir will default to current dir */
		user.Token, "", filepath.Base(repo))
}

func BookContributeCommand() *commander.Command {
	return commander.NewCommand(`contribute`,
		`Join an existing book as a contributor`,
		nil,
		func(args []string) error {
			if 1 != len(args) {
				return errors.New(`book join requires 1 parameter, the username/repo of the book to join`)
			}
			return BookContribute(context.Background(), args[0])
		})
}

func BookCloneCommand() *commander.Command {
	return commander.NewCommand(`clone`,
		`Create a local copy of the given book from your github repo`,
		nil,
		func(args []string) error {
			if 1 != len(args) {
				return errors.New(`book clone requires 1 parameter, the name of your github hosted book`)
			}
			return BookClone(context.Background(), args[0])
		})
}

func BookCreatePullRequestCommand() *commander.Command {
	fs := flag.NewFlagSet(`create-pullrequest`, flag.ExitOnError)
	title := fs.String(`title`, ``, `Pull request title`)
	notes := fs.String(`notes`, ``, `Pull request notes`)
	remote := fs.String(`remote`, `origin`, `Remote to make pr on`)
	upstreamBranch := fs.String(`branch`, `master`, `Branch of upstream server on which to create PR`)

	return commander.NewCommand(`create-pullrequest`,
		`Create a pull request of the current book.`,
		fs,
		func(args []string) error {
			workingDir, err := os.Getwd()
			if nil != err {
				return util.Error(err)
			}
			client, err := config.Config.GithubClient()
			if nil != err {
				return util.Error(err)
			}
			user, err := config.Config.GetUser()
			if nil != err {
				return util.Error(err)
			}

			return git.GithubCreatePullRequest(context.Background(),
				client,
				user.Token,      // github username
				workingDir,      // This defines my repo and my current branch, and hence also my upstream
				*remote,         // git 'remote' on which to make pr
				*upstreamBranch, // The upstream branch I wish to PR against
				*title, *notes)

			return errors.New(`Not implemented yet`)
		})
}

func BookClone(cntxt context.Context, repoName string) error {
	client, err := config.Config.GithubClient()
	if nil != err {
		return err
	}
	user, err := config.Config.GetUser()
	if nil != err {
		return util.Error(err)
	}
	// Checkout our repo as ourselves.
	return git.GitCloneTo(cntxt, client,
		"", /* empty working dir will default to current dir */
		user.Token, "", repoName)
}

// BookNew creates a new book with the newRepoName for the current client,
// based on the templateRepo given.
func BookNew(templateRepo, newRepoName string) error {
	cntxt := context.Background()
	client, err := config.Config.GithubClient()
	if nil != err {
		return err
	}
	user, err := config.Config.GetUser()
	if nil != err {
		return util.Error(err)
	}
	if err := git.DuplicateRepo(cntxt, client, user.Token, templateRepo, newRepoName); nil != err {
		return err
	}

	// Checkout our new repo as ourselves.
	return git.GitCloneTo(cntxt, client, "", /* empty working dir will default to current dir */
		user.Token, "", newRepoName)
}
