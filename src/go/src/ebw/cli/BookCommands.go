package cli

import (
	"errors"
	"flag"
	"os"
	"path/filepath"
	"strings"

	"github.com/craigmj/commander"
	"github.com/google/go-github/github"

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
			client, err := git.ClientFromCLIConfig()
			if nil != err {
				return err
			}

			return BookNew(client, *template, args[0])
		})
}

func BookContribute(client *git.Client, repo string) error {
	parts := strings.Split(repo, `/`)
	if 2 != len(parts) {
		return errors.New(`repo should be user/repo format`)
	}
	_, _, err := client.Repositories.CreateFork(
		client.Context,
		parts[0],
		parts[1],
		&github.RepositoryCreateForkOptions{})
	if nil != err {
		return err
	}

	return git.GitCloneTo(client, "", /* empty working dir will default to current dir */
		"", filepath.Base(repo))
}

func BookContributeCommand() *commander.Command {
	return commander.NewCommand(`contribute`,
		`Join an existing book as a contributor`,
		nil,
		func(args []string) error {
			if 1 != len(args) {
				return errors.New(`book join requires 1 parameter, the username/repo of the book to join`)
			}
			client, err := git.ClientFromCLIConfig()
			if nil != err {
				return err
			}
			return BookContribute(client, args[0])
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

			client, err := git.ClientFromCLIConfig()
			if nil != err {
				return err
			}
			return BookClone(client, args[0])
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

			client, err := git.ClientFromCLIConfig()
			if nil != err {
				return err
			}

			return git.GithubCreatePullRequest(client,
				workingDir,      // This defines my repo and my current branch, and hence also my upstream
				*remote,         // git 'remote' on which to make pr
				*upstreamBranch, // The upstream branch I wish to PR against
				*title, *notes)

			return errors.New(`Not implemented yet`)
		})
}

func BookClone(client *git.Client, repoName string) error {
	// Checkout our repo as ourselves.
	return git.GitCloneTo(client,
		"", /* empty working dir will default to current dir */
		"", repoName)
}

// BookNew creates a new book with the newRepoName for the current client,
// based on the templateRepo given.
func BookNew(client *git.Client, templateRepo, newRepoName string) error {
	if err := git.DuplicateRepo(client, client.Token, templateRepo, newRepoName); nil != err {
		return err
	}

	// Checkout our new repo as ourselves.
	return git.GitCloneTo(client, "", /* empty working dir will default to current dir */
		"", newRepoName)
}
