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
				GitFileCatCommand,
				GitFileConflictedCommand,
				GitHasConflictsCommand,
				GitListConflictsCommand,
				GitPathOurCommand,
				GitPathTheirCommand,
				GitRemoteUserCommand,
				GitRepoStateCommand,
				GitSetRemoteUserPasswordCommand,
				GitSetUsernameEmailCommand,
			)
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
