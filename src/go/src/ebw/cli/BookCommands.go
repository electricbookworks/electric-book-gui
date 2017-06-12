package cli

import (
	"errors"
	"flag"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/craigmj/commander"
	"github.com/google/go-github/github"
	git2go "gopkg.in/libgit2/git2go.v25"

	"ebw/git"
	"ebw/util"
)

var _ = fmt.Println

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
				BookMergeUpstreamCommand,
				BookStatusCommand,
				BookStatusCountCommand,
				BookStateCommand,
				BookUpstreamCommand,
				BookSetUpstreamRemoteCommand,
				BookEBMStateCommand,
				BookStagedFilesCommand,
				BookStashCommand,
				BookUnstashCommand,
				BookPullCommand,
				BookPullAbortCommand,
				BookCatCommand,
				BookMergeHeadsCommand,
				BookResetConflictedCommand,
				BookCleanupCommand,
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

func BookMergeUpstreamCommand() *commander.Command {
	fs := flag.NewFlagSet(`merge-upstream`, flag.ExitOnError)
	remote := fs.String(`remote`, `origin`, `The name of the upstream remote`)
	return commander.NewCommand(`merge-upstream`,
		`Merge the current working directory with changes from the upstream master`,
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

			repo, err := git2go.OpenRepository(workingDir)
			if nil != err {
				return err
			}
			defer repo.Free()

			remote, err := git.FetchRemoteForRepoDir(client, workingDir, *remote)
			defer remote.Free()

			refs, err := remote.FetchRefspecs()
			if nil != err {
				return err
			}
			for _, r := range refs {
				fmt.Println(r)
			}

			heads, err := remote.Ls()
			if nil != err {
				return err
			}

			head, err := repo.Head()
			if nil != err {
				return util.Error(err)
			}
			defer head.Free()
			var masterId *git2go.Oid

			for _, h := range heads {
				// fmt.Println(h.Name)
				if `refs/heads/master` == h.Name {
					ahead, behind, err := repo.AheadBehind(head.Target(), h.Id)
					if nil != err {
						return util.Error(err)
					}
					fmt.Printf("Ahead by %d, Behind by %d\n", ahead, behind)
					masterId = h.Id
				}
			}
			if nil == masterId {
				return fmt.Errorf(`Failed to find remote master head`)
			}
			ancestorId, err := repo.MergeBase(head.Target(), masterId)
			if nil != err {
				return util.Error(err)
			}
			fmt.Printf("Found ancestory %s\n", ancestorId)

			masterCommit, err := repo.LookupAnnotatedCommit(masterId)
			if nil != err {
				return util.Error(err)
			}
			fmt.Printf("Master is annotated commit %s\n", masterCommit)
			defer masterCommit.Free()

			analysis, _, err := repo.MergeAnalysis([]*git2go.AnnotatedCommit{masterCommit})
			if nil != err {
				fmt.Fprintf(os.Stderr, "ERROR on MergeAnalysis: %s\n", err.Error())
				return err
			}
			if git2go.MergeAnalysisNone == analysis {
				fmt.Println(`MergeAnalysisNone - no merge possible (unused)`)
			}
			if 0 < analysis&git2go.MergeAnalysisNormal {
				fmt.Println(`MergeAnalysisNormal - normal merge required`)
			}
			if 0 < analysis&git2go.MergeAnalysisUpToDate {
				fmt.Println(`MergeAnalysisUpToDate - your HEAD is up to date`)
			}
			if 0 < analysis&git2go.MergeAnalysisFastForward {
				fmt.Println(`MergeAnalysisFastForward - your HEAD hasn't diverged`)
			}
			if 0 < analysis&git2go.MergeAnalysisUnborn {
				fmt.Println(`MergeAnalysisUnborn - HEAD is unborn and merge not possible`)
			}

			// master, err := repo.LookupBranch(`origin/master`, git2go.BranchRemote)
			// if nil != err {
			// 	return err
			// }
			defaultMergeOptions, err := git2go.DefaultMergeOptions()
			if nil != err {
				return err
			}
			if err := repo.Merge([]*git2go.AnnotatedCommit{masterCommit},
				&defaultMergeOptions,
				// &git2go.MergeOptions{},
				nil,
				//&git2go.CheckoutOpts{},
			); nil != err {
				fmt.Fprintf(os.Stderr, "ERROR on Merge: %s\n", err.Error())
				return err
			}

			return nil
		})
}

func BookStatusCommand() *commander.Command {
	fs := flag.NewFlagSet(`status`, flag.ExitOnError)
	return commander.NewCommand(`status`, `Show status of book repo files`,
		fs,
		func([]string) error {
			repo, err := cliRepo()
			if nil != err {
				return util.Error(err)
			}
			defer repo.Free()

			return repo.PrintStatusList()
		})
}

func BookStatusCountCommand() *commander.Command {
	fs := flag.NewFlagSet(`status-count`, flag.ExitOnError)
	return commander.NewCommand(`status-count`,
		`Count the index and workingdir files modified`,
		fs,
		func([]string) error {
			repo, err := cliRepo()
			if nil != err {
				return err
			}
			defer repo.Free()
			indexCount, wtCount, err := repo.StatusCount()
			if nil != err {
				return err
			}
			fmt.Printf("Index: %d, Working Tree: %d\n", indexCount, wtCount)
			return nil
		})
}

func BookStateCommand() *commander.Command {
	return commander.NewCommand(`state`,
		`Show the state of the working dir`,
		nil,
		func([]string) error {
			repo, err := cliRepo()
			if nil != err {
				return err
			}
			defer repo.Free()
			fmt.Println(git.GitRepositoryStateToString(repo.State()))
			return nil
		})
}

// BookUpstreamCommand returns upstream for this repo _on GitHub_.
// This is not the github repo for the repo, since this will automatically
// be the upstream of the given repo (ie origin), but rather the original
// repo from which origin was forked, assuming it has been forked.
func BookUpstreamCommand() *commander.Command {
	return commander.NewCommand(`upstream`,
		`Show the github upstream for this repo`,
		nil,
		func([]string) error {
			repo, err := cliRepo()
			if nil != err {
				return err
			}
			defer repo.Free()
			gr, err := repo.GithubRepo()
			if nil != err {
				return err
			}
			if nil == gr.Parent {
				return fmt.Errorf(`This repo has no github parent: it was not forked.`)
			}
			fmt.Println(gr.Parent.GetFullName())
			return nil
		})
}

func BookSetUpstreamRemoteCommand() *commander.Command {
	return commander.NewCommand(`set-upstream`,
		`Set the upstream for this repo`,
		nil,
		func([]string) error {
			repo, err := cliRepo()
			if nil != err {
				return err
			}
			defer repo.Free()
			return repo.SetUpstreamRemote()
		})
}

func BookEBMStateCommand() *commander.Command {
	return commander.NewCommand(`ebm-state`,
		`Display the EBM computed state of the repository`,
		nil,
		func([]string) error {
			repo, err := cliRepo()
			if nil != err {
				return err
			}
			defer repo.Free()
			state, err := repo.GetRepoState()
			if nil != err {
				return err
			}
			fmt.Println(state.String())
			return nil
		})
}

func BookStagedFilesCommand() *commander.Command {
	return commander.NewCommand(`staged-files`,
		`Show the files staged for commit`,
		nil,
		func([]string) error {
			repo, err := cliRepo()
			if nil != err {
				return err
			}
			defer repo.Free()
			staged, err := repo.StagedFiles()
			if nil != err {
				return err
			}
			for _, f := range staged {
				fmt.Printf("%s\t%s\n", f.Path(), f.StatusString())
			}
			return nil
		})
}

func BookStashCommand() *commander.Command {
	return commander.NewCommand(`stash`,
		`Stash all current changes`,
		nil,
		func(args []string) error {
			msg := `Stash message not supplied`
			if 0 <= len(args) {
				msg = strings.Join(args, ` `)
			}
			repo, err := cliRepo()
			if nil != err {
				return err
			}
			defer repo.Free()
			oid, err := repo.Stash(msg)
			if nil != err {
				return err
			}
			fmt.Printf("Stashed as object %s\n", oid.String())
			return nil
		})
}

func BookUnstashCommand() *commander.Command {
	return commander.NewCommand(`unstash`,
		`Unstash all previously stashed changes`,
		nil,
		func([]string) error {
			repo, err := cliRepo()
			if nil != err {
				return err
			}
			defer repo.Free()
			return repo.Unstash()
		})
}

func BookPullCommand() *commander.Command {
	fs := flag.NewFlagSet(`pull`, flag.ExitOnError)
	remote := fs.String(`remote`, `origin`, `Remote to pull`)
	branch := fs.String(`branch`, `master`, `Branch to pull`)
	return commander.NewCommand(`pull`,
		`Pull the remote/branch into the repo`,
		fs,
		func([]string) error {
			repo, err := cliRepo()
			if nil != err {
				return err
			}
			defer repo.Free()
			return repo.Pull(*remote, *branch)
		})
}

func BookPullAbortCommand() *commander.Command {
	return commander.NewCommand(`pull-abort`,
		`Abort the in-progress merge (pull)`,
		nil,
		func([]string) error {
			repo, err := cliRepo()
			if nil != err {
				return err
			}
			defer repo.Free()
			return repo.PullAbort()
		})
}

func BookCatCommand() *commander.Command {
	fs := flag.NewFlagSet(`cat`, flag.ExitOnError)
	version := fs.Int(`v`, 2, `Version 2=ours, 3=theirs`)
	return commander.NewCommand(`cat`,
		`Cat the file contents of the named files`,
		fs,
		func(files []string) error {
			repo, err := cliRepo()
			if nil != err {
				return err
			}
			defer repo.Free()
			for _, f := range files {
				contents, err := repo.FileCat(f, git.FileVersion(*version))
				if nil != err {
					return err
				}
				fmt.Println(string(contents))
			}
			return nil
		})
}

func BookMergeHeadsCommand() *commander.Command {
	fs := flag.NewFlagSet(`merge-heads`, flag.ExitOnError)
	return commander.NewCommand(`merge-heads`,
		`merge-heads test`,
		fs,
		func([]string) error {
			repo, err := cliRepo()
			if nil != err {
				return err
			}
			defer repo.Free()
			heads, err := repo.MergeHeads()
			if nil != err {
				return err
			}
			for _, h := range heads {
				fmt.Println(h)
			}
			return nil
		})
}

func BookResetConflictedCommand() *commander.Command {
	fs := flag.NewFlagSet(`reset-conflicted`, flag.ExitOnError)
	all := fs.Bool(`all`, false, `Reset all files`)
	theirs := fs.Bool(`theirs`, false, `Reset to their version`)
	onlyConflicted := fs.Bool(`only-conflicted`, true, `Reset only conflicted files`)
	return commander.NewCommand(`reset-conflicted`,
		`Resets conflicted files in the repo. Provide a list of files to reset.`,
		fs,
		func(files []string) error {
			if 0 == len(files) && !*all {
				return fmt.Errorf(`You need to set -all if you don't provide a list of files`)
			}
			filter := func(r *git.Repo, path string, entry *git2go.StatusEntry) bool {
				if 0 == len(files) {
					return true
				}
				for _, f := range files {
					if f == path {
						return true
					}
				}
				return false
			}

			repo, err := cliRepo()
			if nil != err {
				return err
			}
			defer repo.Free()

			return repo.ResetConflictedFilesInWorkingDir(
				!*theirs,
				*onlyConflicted,
				filter)
		})
}

func BookCleanupCommand() *commander.Command {
	return commander.NewCommand(`cleanup`,
		`Cleansup repo merge artifacts`,
		nil,
		func([]string) error {
			repo, err := cliRepo()
			if nil != err {
				return err
			}
			defer repo.Free()
			if err := repo.Cleanup(); nil != err {
				return err
			}
			return nil
		})
}
