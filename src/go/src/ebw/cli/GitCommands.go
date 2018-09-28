package cli

import (
	"bytes"
	"flag"
	"fmt"
	"io"
	"os"
	"strings"

	"github.com/craigmj/commander"

	"ebw/git"
	// "ebw/util"
)

func newGit() (*git.Git, error) {
	wd, err := os.Getwd()
	if nil != err {
		return nil, err
	}
	return git.OpenGit(wd, nil)
}

func mustNewGit() *git.Git {
	g, err := newGit()
	if nil != err {
		panic(err)
	}
	return g
}

func GitCommands() *commander.Command {
	return commander.NewCommand(`git`, `git related commands`,
		nil,
		func(args []string) error {
			return commander.Execute(args,
				GitAheadBehindCommand,
				GitCommitCommand,
				GitFetchRefspecsCommand,
				GitFetchRemoteCommand,
				GitFileCatCommand,
				GitFileConflictedCommand,
				GitFileDiffsCommand,
				GitFileDiffsConflictCommand,
				GitFileExistsCommand,
				GitGithubRemoteCommand,
				GitHasConflictsCommand,
				GitHeadSHACommand,
				GitListConflictsCommand,
				GitMergeAnalysisCommand,
				GitMergeAutoCommand,
				GitMergeCanFastForwardCommand,
				GitMergeConflictCommand,
				GitPathOurCommand,
				GitPathTheirCommand,
				GitPrintEBWStatusCommand,
				GitPullAbortCommand,
				GitPushCommand,
				GitRemoteUserCommand,
				GitRemoveConflictCommand,
				GitRepoStateCommand,
				GitSetRemoteUserPasswordCommand,
				GitSetUsernameEmailCommand,
				GitUpdateRemoteGithubIdentityCommand,
				GitUpstreamActionCommand,
				GitUpstreamCanPullCommand,
				GitUpstreamCanCreatePRCommand,
				GitTagDiffCommand,
			)
		})
}

func GitAheadBehindCommand() *commander.Command {
	fs := flag.NewFlagSet(`ahead-behind`, flag.ExitOnError)
	remote := fs.String(`remote`, `origin`, `Remote to check`)
	return commander.NewCommand(`ahead-behind`, `Report ahead-behind for the remote repo`,
		fs,
		func([]string) error {
			g := mustNewGit()
			defer g.Close()
			ahead, behind, err := g.AheadBehind(*remote)
			if nil != err {
				return err
			}
			fmt.Printf("HEAD is %d ahead, %d behind %s\n", ahead, behind, *remote)
			return nil
		})
}

func GitCommitCommand() *commander.Command {
	return commander.NewCommand(`commit`, `commit all staged changes`,
		nil,
		func(msg []string) error {
			g := mustNewGit()
			defer g.Close()
			oid, err := g.Commit(strings.Join(msg, " "))
			if nil != err {
				return err
			}
			fmt.Println("Commit #", oid.String())
			return nil
		})
}

func GitFetchRefspecsCommand() *commander.Command {
	return commander.NewCommand(`fetch-refspecs`, `fetch refspecs for a remote`,
		nil,
		func(remotes []string) error {
			g := mustNewGit()
			defer g.Close()
			for _, r := range remotes {
				specs, err := g.FetchRefspecs(r)
				if nil != err {
					return err
				}
				fmt.Printf("%s:\n  %s\n---\n", r, strings.Join(specs, "  \n  "))
			}
			return nil
		})
}

func GitFetchRemoteCommand() *commander.Command {
	return commander.NewCommand(`fetch`, `fetch a remote repo`,
		nil,
		func(args []string) error {
			g := mustNewGit()
			defer g.Close()
			for _, r := range args {
				if err := g.FetchRemote(r); nil != err {
					return err
				}
				// fmt.Println(`fetched `, r)
			}
			return nil
		})
}

func GitFileCatCommand() *commander.Command {
	fs := flag.NewFlagSet(`file-cat`, flag.ExitOnError)
	v := fs.String(`v`, `our-wd`, `Version of the file to display`)
	return commander.NewCommand(`file-cat`, `Cat file contents for a given version`,
		fs,
		func(args []string) error {
			g := mustNewGit()
			defer g.Close()
			ver, err := git.ParseGitFileVersion(*v)
			if nil != err {
				return err
			}
			for _, fn := range args {
				raw, err := g.CatFileVersion(fn, ver, nil)
				if nil != err {
					return err
				}
				io.Copy(os.Stdout, bytes.NewReader(raw))
			}
			return nil
		})
}

func GitFileExistsCommand() *commander.Command {
	fs := flag.NewFlagSet(`file-exists`, flag.ExitOnError)
	v := fs.String(`v`, `our-wd`, `Version of the file to display`)
	return commander.NewCommand(`file-exists`, `Cat file contents for a given version`,
		fs,
		func(args []string) error {
			g := mustNewGit()
			defer g.Close()
			ver, err := git.ParseGitFileVersion(*v)
			if nil != err {
				return err
			}
			for _, fn := range args {
				raw, err := g.CatFileVersion(fn, ver, nil)
				if nil != err {
					return err
				}
				io.Copy(os.Stdout, bytes.NewReader(raw))
			}
			return nil
		})
}

func GitFileConflictedCommand() *commander.Command {
	return commander.NewCommand(`file-conflicted`, `Return true if a file is conflicted`,
		nil,
		func(args []string) error {
			if 1 != len(args) {
				return fmt.Errorf(`Please pass a single parameter : the file to check`)
			}
			g := mustNewGit()
			defer g.Close()
			c, err := g.IsFileConflicted(args[0])
			if nil != err {
				return err
			}
			if c {
				fmt.Println(`CONFLICTED`)
			} else {
				fmt.Println(`not conflicted`)
				os.Exit(1)
			}
			return nil
		})
}

func GitFileDiffsCommand() *commander.Command {
	return commander.NewCommand(`file-diffs`,
		`Return the file diffs between HEAD and the given remote/branch`,
		nil,
		func(branches []string) error {
			g := mustNewGit()
			defer g.Close()
			for _, b := range branches {
				head, err := g.GetBranch(`HEAD`)
				if nil != err {
					return err
				}
				defer head.Free()
				other, err := g.GetBranch(b)
				if nil != err {
					return err
				}
				defer other.Free()
				diffs, err := g.CommitFileDiffs(head, other)
				if nil != err {
					return err
				}
				fmt.Println(`Diffs HEAD ->`, b, `:`)
				for _, d := range diffs {
					fmt.Println(d)
				}
				fmt.Println(`---`)
			}
			return nil
		})
}

func GitFileDiffsConflictCommand() *commander.Command {
	return commander.NewCommand(`file-diffs-conflict`,
		`Set all file diffs between HEAD and the given remote/branch to be conflicted`,
		nil,
		func(branches []string) error {
			g := mustNewGit()
			defer g.Close()
			for _, b := range branches {
				head, err := g.GetBranch(`HEAD`)
				if nil != err {
					return err
				}
				defer head.Free()
				other, err := g.GetBranch(b)
				if nil != err {
					return err
				}
				defer other.Free()
				if err := g.ConflictFileDiffs(head, other); nil != err {
					return err
				}
			}
			return nil
		})
}

func GitGithubRemoteCommand() *commander.Command {
	return commander.NewCommand(`github-remote`, `Display details on the github remote`,
		nil,
		func([]string) error {
			g := mustNewGit()
			defer g.Close()
			gr, err := g.GithubRemote(`origin`)
			if nil != err {
				return err
			}
			fmt.Printf("%v\n", gr)
			return nil
		})
}

func GitHasConflictsCommand() *commander.Command {
	return commander.NewCommand(`has-conflicts`, `Return true if the repo has conflicts`,
		nil,
		func([]string) error {
			g := mustNewGit()
			defer g.Close()
			c, err := g.HasConflicts()
			if nil != err {
				return err
			}
			if c {
				fmt.Println(`TRUE`)
			} else {
				fmt.Println(`no conflicts in repo`)
				os.Exit(1)
			}
			return nil
		})
}

func GitHeadSHACommand() *commander.Command {
	fs := flag.NewFlagSet(`head-sha`, flag.ExitOnError)
	remote := fs.String(`remote`, ``, `Remote to check`)
	return commander.NewCommand(`head-sha`, `Print the SHA of the repo's HEAD tree`,
		fs,
		func([]string) error {
			g := mustNewGit()
			defer g.Close()
			var sha string
			var err error
			if `` == *remote {
				sha, err = g.SHAHead()
			} else {
				sha, err = g.SHARemote(*remote, true)
			}
			if nil != err {
				return err
			}
			fmt.Println(sha)
			return nil
		})
}

func GitListConflictsCommand() *commander.Command {
	return commander.NewCommand(`list-conflicts`, `List all conflicted files in the repo`,
		nil,
		func([]string) error {
			g := mustNewGit()
			defer g.Close()
			conflicts, err := g.ListConflictedFiles()
			if nil != err {
				return err
			}
			fmt.Println(strings.Join(conflicts, "\n"))
			return nil
		})
}

func GitMergeAnalysisCommand() *commander.Command {
	return commander.NewCommand(`merge-analysis`,
		`Analysis of possible merge with the given remote`,
		nil,
		func(remotes []string) error {
			g := mustNewGit()
			defer g.Close()
			for _, r := range remotes {
				an, pref, err := g.MergeAnalysis(r)
				if nil != err {
					return err
				}
				fmt.Println(`Analysis:`, git.GitMergeAnalysisToString(an), `, Preference:`,
					git.GitMergePreferenceToString(pref))
			}
			return nil
		})
}

func GitMergeAutoCommand() *commander.Command {
	return commander.NewCommand(`merge-auto`, `Automatically merge the given remote/branch and automatically resolve`,
		nil,
		func(args []string) error {
			g := mustNewGit()
			defer g.Close()
			_, err := g.MergeBranch(args[0], git.ResolveAutomatically)
			return err
		})
}

func GitMergeCanFastForwardCommand() *commander.Command {
	return commander.NewCommand(`merge-can-fastforward`,
		`TRUE if the merge can fastforward`,
		nil,
		func(remotes []string) error {
			g := mustNewGit()
			defer g.Close()
			if 1 != len(remotes) {
				return fmt.Errorf(`REQUIRE a single remote argument`)
			}
			ff, err := g.MergeCanFastForward(remotes[0])
			if nil != err {
				return err
			}
			if ff {
				fmt.Println("TRUE")
			} else {
				fmt.Println("cannot fast-forward")
				os.Exit(1)
			}
			return nil
		})
}
func GitMergeConflictCommand() *commander.Command {
	return commander.NewCommand(`merge-conflict`, `Merge with the given remote/branch and leave all items in a conflicted state.`,
		nil,
		func(args []string) error {
			g := mustNewGit()
			defer g.Close()
			_, err := g.MergeBranch(args[0], git.ResolveConflicted)
			return err
		})
}

func GitPathOurCommand() *commander.Command {
	return commander.NewCommand(`path-our`, `Path to a file in our git repo directory`,
		nil,
		func(args []string) error {
			g := mustNewGit()
			defer g.Close()
			fmt.Println(g.Path(args...))
			return nil
		})
}

func GitPathTheirCommand() *commander.Command {
	return commander.NewCommand(`path-their`, `Path to a file in 'their' git repo directory`,
		nil,
		func(args []string) error {
			g := mustNewGit()
			defer g.Close()
			fmt.Println(g.PathTheir(args...))
			return nil
		})
}

func GitPrintEBWStatusCommand() *commander.Command {
	return commander.NewCommand(`ebw-status`,
		`Print the EBW Repo Status for the repo`,
		nil,
		func(args []string) error {
			g := mustNewGit()
			defer g.Close()
			g.PrintEBWRepoStatus(os.Stdout)
			return nil
		})
}

func GitPullAbortCommand() *commander.Command {
	return commander.NewCommand(`pull-abort`,
		`Abort the in-process pull operation`,
		nil,
		func(args []string) error {
			g := mustNewGit()
			defer g.Close()
			return g.PullAbort(false)
		})
}

func GitPushCommand() *commander.Command {
	fs := flag.NewFlagSet(`push`, flag.ExitOnError)
	remoteName := fs.String(`remote`, `origin`, `Remote to which to push`)
	remoteBranch := fs.String(`branch`, `master`, `Remote branch to which to push`)
	return commander.NewCommand(`push`,
		`Push the repo`,
		fs,
		func(args []string) error {
			g := mustNewGit()
			defer g.Close()
			return g.Push(*remoteName, *remoteBranch)
		})
}

func GitRemoteUserCommand() *commander.Command {
	return commander.NewCommand(`remote-user`, `Show the user and password for the given remote`,
		nil,
		func(args []string) error {
			remote := `origin`
			if 0 < len(args) {
				remote = args[0]
			}
			g := mustNewGit()
			defer g.Close()
			user, pass, err := g.RemoteUser(remote)
			if nil != err {
				return err
			}
			fmt.Println(user, `:`, pass)
			return nil
		})
}

func GitRemoveConflictCommand() *commander.Command {
	return commander.NewCommand(`remove-conflict`, `Remove the conflict on the given file`,
		nil,
		func(files []string) error {
			g := mustNewGit()
			defer g.Close()
			for _, f := range files {
				if err := g.RemoveConflict(f); nil != err {
					return err
				}
			}
			return nil
		})
}

func GitSetRemoteUserPasswordCommand() *commander.Command {
	fs := flag.NewFlagSet(`set-remote-user-password`, flag.ExitOnError)
	remote := fs.String(`r`, ``, `Remote to set`)
	user := fs.String(`u`, ``, `Remote username`)
	password := fs.String(`p`, ``, `Remote password`)
	return commander.NewCommand(`set-remote-user-password`, `Set the git remote user and password`,
		fs,
		func(args []string) error {
			g := mustNewGit()
			defer g.Close()
			return g.SetRemoteUserPassword(*remote, *user, *password)
		})
}

func GitRepoStateCommand() *commander.Command {
	return commander.NewCommand(`repo-state`, `Get the state of the repo`,
		nil,
		func([]string) error {
			g := mustNewGit()
			defer g.Close()
			state := g.RepoState()
			fmt.Println(state)
			return nil
		})
}

func GitSetUsernameEmailCommand() *commander.Command {
	return commander.NewCommand(`set-username`, `Set the git config user.name and user.email`,
		nil,
		func(args []string) error {
			g := mustNewGit()
			defer g.Close()
			user, email := ``, ``
			if 0 == len(args) {
				return fmt.Errorf(`You need to supply name to set`)
			}
			user = args[0]
			if 1 < len(args) {
				email = args[1]
			}
			return g.SetUsernameEmail(user, email)
		})
}


func GitTagDiffCommand() *commander.Command {
	return commander.NewCommand(`tagdiff`, `diff between two tags`,
		nil,
		func(args []string) error {
			if 2!=len(args) {
				return fmt.Errorf(`You must supply the two tags to diff as params to tagdiff: ebw tagdiff [t1] [t2]`)
			}
			g := mustNewGit()
			defer g.Close()

			return g.TagDiff(args[0], args[1])

			return nil
		})
}

func GitUpdateRemoteGithubIdentityCommand() *commander.Command {
	fs := flag.NewFlagSet(`update-github-identity`, flag.ExitOnError)
	u := fs.String(`u`, ``, `Username for github`)
	p := fs.String(`p`, ``, `Password for github`)
	return commander.NewCommand(`update-github-identity`,
		`Set the username and password for all github remotes`,
		fs,
		func(args []string) error {
			g := mustNewGit()
			defer g.Close()
			if `` == *u {
				return fmt.Errorf(`You need to provide a username (-u)`)
			}
			if `` == *p {
				return fmt.Errorf(`You need to provide a password (-p)`)
			}

			return g.UpdateRemoteGithubIdentity(*u, *p)
		})
}

func GitUpstreamActionCommand() *commander.Command {
	fs := flag.NewFlagSet(`upstream-action`, flag.ExitOnError)
	return commander.NewCommand(`upstream-action`,
		`Show possible upstream actions`,
		fs,
		func(args []string) error {
			g := mustNewGit()
			defer g.Close()
			acts, err := g.GetUpstreamRemoteActions()
			if nil != err {
				return err
			}
			fmt.Printf("%s\n", acts)
			return nil
		})
}
func GitUpstreamCanPullCommand() *commander.Command {
	return commander.NewCommand(`upstream-can-pull`,
		`TRUE if you can pull from upstream`,
		nil,
		func([]string) error {
			g := mustNewGit()
			defer g.Close()
			acts, err := g.GetUpstreamRemoteActions()
			if nil != err {
				return err
			}
			if acts.CanPull() {
				fmt.Println("TRUE")
				return nil
			}
			fmt.Println("FALSE")
			os.Exit(1)
			return nil

		})
}

func GitUpstreamCanCreatePRCommand() *commander.Command {
	return commander.NewCommand(`upstream-can-create-pr`,
		`TRUE if you can create a PR to upstream`,
		nil,
		func([]string) error {
			g := mustNewGit()
			defer g.Close()
			acts, err := g.GetUpstreamRemoteActions()
			if nil != err {
				return err
			}
			if acts.CanCreatePR() {
				fmt.Println("TRUE")
				return nil
			}
			fmt.Println("FALSE")
			os.Exit(1)
			return nil
		})
}
