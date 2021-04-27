package cli

import (
	"encoding/json"
	"errors"
	"flag"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/craigmj/commander"
	"github.com/golang/glog"
	"github.com/google/go-github/github"
	"golang.org/x/crypto/ssh/terminal"
	git2go "github.com/libgit2/git2go/v31"

	"ebw/git"
	"ebw/util"
)

var _ = fmt.Println

// IsTerminal returns true if the application is running in a terminal,
// or false if it is running in another environment (eg streamed)
func IsTerminal() bool {
	return terminal.IsTerminal(int(os.Stdout.Fd()))
}

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
				BookPullUpstreamCommand,
				BookPullOriginCommand,
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
				BookPushCommand,
				BookCatCommand,
				BookMergeHeadsCommand,
				BookResetConflictedCommand,
				BookCleanupCommand,
				BookPRCloseCommand,
				BookPRListCommand,
				BookPRDetailCommand,
				BookPRFetchCommand,
				BookPRMergeCommand,
				BookMergeInfo,
				BookFetchCommand,
				BookLocalChangesCommand,
				BookRevertLocalChangesCommand,
				BookConflictedFilesCommand,
				BookHasConflictsCommand,
				BookDumpIndexCommand,
				BookTheirPathCommand,
				BookOurPathCommand,
			)
		})
}

func BookNewCommand() *commander.Command {
	fs := flag.NewFlagSet(`new`, flag.ExitOnError)
	org := fs.String(`org`, ``, `Organization to add new book, if not to own user account`)
	template := fs.String(`template`, `electricbookworks/electric-book`, `Book generation template`)

	username := fs.String(`u`, ``, `Github Username`)
	password := fs.String(`p`, ``, `Github password`)

	return commander.NewCommand(`new`,
		`Create a new book with the given name`,
		fs,
		func(args []string) error {
			if 1 != len(args) {
				return errors.New(`book new requires 1 parameter, the name of the new book repo`)
			}
			client, err := git.ClientFromUsernamePassword(*username, *password)
			if nil != err {
				return err
			}

			return BookNew(client, *template, *org, args[0])
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
		if !strings.Contains(err.Error(), "try again later") {
			glog.Errorf("CreateFork failed : %s", err.Error())
			return err
		}
	}

	return git.GitCloneTo(client, "", /* empty working dir will default to current dir */
		"", filepath.Base(repo))
}

func BookContributeCommand() *commander.Command {
	fs := flag.NewFlagSet("contribute", flag.ExitOnError)
	username := fs.String(`u`, ``, `Github Username`)
	password := fs.String(`p`, ``, `Github password`)
	return commander.NewCommand(`contribute`,
		`Join an existing book as a contributor`,
		fs,
		func(args []string) error {
			if 1 != len(args) {
				return errors.New(`book join requires 1 parameter, the username/repo of the book to join`)
			}
			client, err := git.ClientFromUsernamePassword(*username, *password)
			if nil != err {
				return err
			}
			return BookContribute(client, args[0])
		})
}

func BookCloneCommand() *commander.Command {
	fs := flag.NewFlagSet("clone", flag.ExitOnError)
	username := fs.String(`u`, ``, `Github Username`)
	password := fs.String(`p`, ``, `Github password`)

	return commander.NewCommand(`clone`,
		`Create a local copy of the given book from your github repo`,
		fs,
		func(args []string) error {
			if 1 != len(args) {
				return errors.New(`book clone requires 1 parameter, the name of your github hosted book`)
			}

			client, err := git.ClientFromUsernamePassword(*username, *password)
			if nil != err {
				return err
			}
			return BookClone(client, args[0])
		})
}

func BookPRCloseCommand() *commander.Command {
	fs := flag.NewFlagSet(`pr-close`, flag.ExitOnError)
	merged := fs.Bool(`merged`, true, `true if the pr was merged, false if not`)
	return commander.NewCommand(`pr-close`,
		`Close the current PR`,
		fs,
		func(args []string) error {
			repo, err := cliRepo()
			if nil != err {
				return err
			}
			defer repo.Close()

			prN, err := repo.MergingPRNumber()
			if nil != err {
				return err
			}
			if 0 == prN {
				return fmt.Errorf(`No Pull Request merge in progress`)
			}
			if err := repo.PullRequestClose(prN, *merged); nil != err {
				return err
			}

			return nil
		})
}

func BookCreatePullRequestCommand() *commander.Command {
	fs := flag.NewFlagSet(`pr-create`, flag.ExitOnError)
	title := fs.String(`title`, ``, `Pull request title`)
	notes := fs.String(`notes`, ``, `Pull request notes`)
	// remote := fs.String(`remote`, `origin`, `Remote to make pr on`)
	// upstreamBranch := fs.String(`branch`, `master`, `Branch of upstream server on which to create PR`)

	return commander.NewCommand(`pr-create`,
		`Create a pull request of the current book.`,
		fs,
		func(args []string) error {
			repo, err := cliRepo()
			if nil != err {
				return err
			}
			defer repo.Close()

			pr, err := repo.PullRequestCreate(*title, *notes)
			if nil != err {
				return err
			}
			if IsTerminal() {
				fmt.Printf("Created PR %d\n", pr)
			} else {
				fmt.Printf("%d", pr)
			}
			return nil
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
func BookNew(client *git.Client, templateRepo, orgName, newRepoName string) error {
	if err := git.DuplicateRepo(client, client.Token, templateRepo, orgName, newRepoName, false); nil != err {
		return err
	}

	// Checkout our new repo as ourselves.
	return git.GitCloneTo(client, "", /* empty working dir will default to current dir */
		"", newRepoName)
}

func BookPullUpstreamCommand() *commander.Command {
	fs := flag.NewFlagSet(`pull-upstream`, flag.ExitOnError)
	return commander.NewCommand(`pull-upstream`,
		`Merge the current working directory with changes from the upstream master`,
		fs,
		func(args []string) error {
			repo, err := cliRepo()
			if nil != err {
				return util.Error(err)
			}
			defer repo.Close()
			return repo.PullUpstream()
		})
}

func BookPullOriginCommand() *commander.Command {
	fs := flag.NewFlagSet(`pull-origin`, flag.ExitOnError)
	return commander.NewCommand(`pull-origin`,
		`Merge the current working directory with changes from the origin master`,
		fs,
		func(args []string) error {
			repo, err := cliRepo()
			if nil != err {
				return util.Error(err)
			}
			defer repo.Close()
			return repo.PullOrigin()
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
			defer repo.Close()

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
			defer repo.Close()
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
			defer repo.Close()
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
			defer repo.Close()
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
			defer repo.Close()
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
			defer repo.Close()
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
			defer repo.Close()
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
			defer repo.Close()
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
			defer repo.Close()
			return repo.Unstash()
		})
}

func BookFetchCommand() *commander.Command {
	fs := flag.NewFlagSet(`fetch`, flag.ExitOnError)
	remote := fs.String(`remote`, `origin`, `Remote to fetch`)
	return commander.NewCommand(`fetch`,
		`Fetch the remote/branch into the repo`,
		fs,
		func([]string) error {
			repo, err := cliRepo()
			if nil != err {
				return err
			}
			defer repo.Close()
			return repo.FetchRemote(*remote)
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
			defer repo.Close()
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
			defer repo.Close()
			return repo.PullAbort(false)
		})
}

func BookCatCommand() *commander.Command {
	fs := flag.NewFlagSet(`cat`, flag.ExitOnError)
	version := fs.Int(`v`, 2, `Version 1=ancestor, 2=ours, 3=theirs`)
	return commander.NewCommand(`cat`,
		`Cat the file contents of the named files`,
		fs,
		func(files []string) error {
			repo, err := cliRepo()
			if nil != err {
				return err
			}
			defer repo.Close()
			for _, f := range files {
				exists, contents, err := repo.FileCat(f, git.FileVersion(*version))
				if nil != err {
					return err
				}
				if !exists {
					fmt.Fprintf(os.Stderr, "%s DOES NOT EXIST\n", f)
				} else {
					fmt.Println(string(contents))
				}
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
			defer repo.Close()
			panic(`CMJ: MergeHeads not implemented on git2go`)
			// heads, err := repo.MergeHeads()
			// if nil != err {
			// 	return err
			// }
			// for _, h := range heads {
			// 	fmt.Println(h)
			// }
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
			defer repo.Close()

			return repo.ResetConflictedFilesInWorkingDir(
				!*theirs,
				*onlyConflicted,
				filter)
		})
}

func BookCleanupCommand() *commander.Command {
	return commander.NewCommand(`cleanup`,
		`Cleans up repo merge artifacts`,
		nil,
		func([]string) error {
			repo, err := cliRepo()
			if nil != err {
				return err
			}
			defer repo.Close()
			if err := repo.Cleanup(); nil != err {
				return err
			}
			return nil
		})
}

func BookPushCommand() *commander.Command {
	fs := flag.NewFlagSet(`push`, flag.ExitOnError)
	remote := fs.String(`remote`, `origin`, `Remote to push to`)
	branch := fs.String(`branch`, `master`, `Remote branch to push to`)
	return commander.NewCommand(`push`,
		`Push the repo to the remote branch`,
		fs,
		func([]string) error {
			repo, err := cliRepo()
			if nil != err {
				return err
			}
			defer repo.Close()
			if err := repo.Push(*remote, *branch); nil != err {
				return err
			}
			return nil
		})
}

func BookPRListCommand() *commander.Command {
	return commander.NewCommand(`pr-list`,
		`List the open PR's for the repo`,
		nil,
		func([]string) error {
			repo, err := cliRepo()
			if nil != err {
				return err
			}
			defer repo.Close()
			prs, err := repo.PullRequestList()
			if nil != err {
				return err
			}
			for _, pr := range prs {
				fmt.Printf("%5d\t%s\n", pr.GetNumber(), pr.GetTitle())
			}
			return nil
		})
}

func BookPRDetailCommand() *commander.Command {
	fs := flag.NewFlagSet(`pr`, flag.ExitOnError)
	number := fs.Int(`n`, 0, `The number of the PR to display`)
	return commander.NewCommand(`pr`,
		`Show the details on a particular pr`,
		fs,
		func([]string) error {
			repo, err := cliRepo()
			if nil != err {
				return err
			}
			defer repo.Close()
			if 0 == *number {
				prs, err := repo.PullRequestList()
				if nil != err {
					return err
				}
				for _, pr := range prs {
					fmt.Printf("%5d\t%s\n", pr.GetNumber(), pr.GetTitle())
				}
				return fmt.Errorf(`You need to specify the PR number (-n)`)
			}
			pr, err := repo.PullRequest(*number)
			if nil != err {
				return err
			}
			js := json.NewEncoder(os.Stdout)
			js.SetIndent(``, `  `)
			if err := js.Encode(pr); nil != err {
				return err
			}
			return nil
		})
}

func BookPRFetchCommand() *commander.Command {
	fs := flag.NewFlagSet(`pr-fetch`, flag.ExitOnError)
	number := fs.Int(`n`, 0, `Number of the PR to fetch`)
	return commander.NewCommand(`pr-fetch`,
		`Fetch the numbered (-n) PR`,
		fs,
		func([]string) error {
			repo, err := cliRepo()
			if nil != err {
				return err
			}
			defer repo.Close()
			return repo.PullRequestFetch(*number, nil)
		})
}

func BookPRMergeCommand() *commander.Command {
	fs := flag.NewFlagSet(`pr-merge`, flag.ExitOnError)
	number := fs.Int(`n`, 0, `Number of the PR to merge`)
	return commander.NewCommand(`pr-merge`,
		`Merge the numbered (-n) PR`,
		fs,
		func([]string) error {
			repo, err := cliRepo()
			if nil != err {
				return err
			}
			defer repo.Close()
			return repo.PullRequestMerge(*number)
		})
}

func BookMergeInfo() *commander.Command {
	return commander.NewCommand(`merge-info`,
		`Provide merge info on the named files`,
		nil,
		func(files []string) error {

			repo, err := cliRepo()
			if nil != err {
				return err
			}
			defer repo.Close()
			for _, f := range files {
				mfi, err := repo.MergeFileInfo(f)
				if nil != err {
					return err
				}
				fmt.Println(mfi)
			}
			return nil
		})
}

func BookLocalChangesCommand() *commander.Command {
	return commander.NewCommand(`local-changes`,
		`List local changes`,
		nil,
		func([]string) error {
			repo, err := cliRepo()
			if nil != err {
				return err
			}
			defer repo.Close()
			return repo.PrintLocalChanges()
		})
}

func BookRevertLocalChangesCommand() *commander.Command {
	return commander.NewCommand(`revert-local-changes`,
		`List local changes`,
		nil,
		func([]string) error {
			repo, err := cliRepo()
			if nil != err {
				return err
			}
			defer repo.Close()
			return repo.RevertLocalChanges()
		})
}

func BookConflictedFilesCommand() *commander.Command {
	return commander.NewCommand(`conflicts`,
		`List conflicted files`,
		nil,
		func([]string) error {
			repo, err := cliRepo()
			if nil != err {
				return err
			}
			defer repo.Close()
			conflicts, err := repo.ListRepoConflicts()
			if nil != err {
				return err
			}
			for _, c := range conflicts {
				fmt.Println(c)
			}
			return nil
		})
}

func BookDumpIndexCommand() *commander.Command {
	return commander.NewCommand(`dump-index`,
		`Dump the git index`,
		nil,
		func([]string) error {
			repo, err := cliRepo()
			if nil != err {
				return err
			}
			defer repo.Close()
			return repo.DumpIndex()
		})
}

func BookHasConflictsCommand() *commander.Command {
	return commander.NewCommand(`has-conflicts`,
		`Displays whether the repo has conflicts or not`,
		nil,
		func([]string) error {
			repo, err := cliRepo()
			if nil != err {
				return err
			}
			defer repo.Close()
			c, err := repo.HasConflictedFiles()
			if nil != err {
				return err
			}
			if c {
				fmt.Println("YES")
			} else {
				fmt.Println("NO")
				os.Exit(1)
			}
			return nil
		})
}

func BookTheirPathCommand() *commander.Command {
	return commander.NewCommand(`their-path`,
		`Show path to their files during a merge`,
		nil,
		func(args []string) error {
			repo, err := cliRepo()
			if nil != err {
				return err
			}
			defer repo.Close()
			fmt.Println(repo.TheirPath(args...))
			return nil
		})
}

func BookOurPathCommand() *commander.Command {
	return commander.NewCommand(`our-path`,
		`Show path to our files during a merge`,
		nil,
		func(args []string) error {
			repo, err := cliRepo()
			if nil != err {
				return err
			}
			defer repo.Close()
			fmt.Println(repo.RepoPath(args...))
			return nil
		})
}
