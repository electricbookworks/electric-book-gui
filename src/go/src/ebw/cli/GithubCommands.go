package cli

import (
	"errors"
	"flag"
	"fmt"

	"github.com/craigmj/commander"

	"ebw/git"
)

func GithubCommand() *commander.Command {
	return commander.NewCommand("github",
		"Github related commands",
		nil,
		func(args []string) error {
			return commander.Execute(args,
				UsernameCommand,
				ReposCommand,
				DeleteRepoCommand,
				RemoteCommand,
				BranchNameCommand,
				RootDirCommand,
				ListWatchersCommand,
			)
		})
}

func UsernameCommand() *commander.Command {
	return commander.NewCommand("username",
		"Show the current github username",
		nil,
		func([]string) error {

			client, err := git.ClientFromCLIConfig()
			if nil != err {
				return err
			}

			fmt.Println(client.Username)
			return nil
		})
}

func ReposCommand() *commander.Command {
	return commander.NewCommand("repos",
		"List all the user's repos on github",
		nil,
		func([]string) error {
			client, err := git.ClientFromCLIConfig()
			if nil != err {
				return err
			}
			repos, _, err := client.Repositories.List(client.Context, "", nil)
			if nil != err {
				return err
			}
			for _, r := range repos {
				fmt.Printf("%s: %s\n", *r.Name, *r.GitURL)
			}
			return nil
		})
}

func DeleteRepoCommand() *commander.Command {
	return commander.NewCommand("delete-repo",
		"Delete a repo from github",
		nil,
		func(args []string) error {
			if 1 != len(args) {
				return errors.New("You need to provide the name of the github repo you want to delete")
			}

			client, err := git.ClientFromCLIConfig()
			if nil != err {
				return err
			}

			return git.GithubDeleteRepo(client.Token,
				client.Username, args[0])
		})
}

func RemoteCommand() *commander.Command {
	fs := flag.NewFlagSet(`remote`, flag.ExitOnError)
	remote := fs.String(`remote`, `origin`, `Remote to query`)
	return commander.NewCommand(`remote`,
		`Display the url path of the remote repo`,
		fs,
		func([]string) error {
			path, project, err := git.GitRemoteRepo(``, *remote)
			if nil != err {
				return err
			}
			fmt.Printf("%s/%s\n", path, project)
			return nil
		})
}

func UserCommand() *commander.Command {
	return commander.NewCommand(`user`,
		`Get the current directory's username on origin remote on github`,
		nil,
		func([]string) error {
			user, err := GetGithubUser(``)
			if nil != err {
				return err
			}
			fmt.Println(user)
			return nil
		})
}

func GetGithubUser(workingDir string) (string, error) {
	githubUser, _, err := git.GitRemoteRepo(workingDir, ``)
	return githubUser, err
}

func BranchNameCommand() *commander.Command {
	return commander.NewCommand(
		`branch-name`,
		`Return the name of the current git branch`,
		nil,
		func([]string) error {

			client, err := git.ClientFromCLIConfig()
			if nil != err {
				return err
			}
			name, err := git.GitCurrentBranch(client, ``)
			if nil != err {
				return err
			}
			fmt.Println(name)
			return nil
		})
}

func RootDirCommand() *commander.Command {
	return commander.NewCommand(
		`root-dir`,
		`Find the root git directory for the current wd`,
		nil,
		func([]string) error {
			root, err := git.GitFindRepoRootDirectory(``)
			if nil != err {
				return err
			}
			fmt.Println(root)
			return nil
		})
}

func ListWatchersCommand() *commander.Command {
	fs := flag.NewFlagSet(`watchers`, flag.ExitOnError)
	repo := fs.String(`repo`, ``, `Repo watched`)
	owner := fs.String(`owner`, ``, `Owner of the repo`)
	return commander.NewCommand(
		`watchers`,
		`List all watchers on this repo`,
		nil,
		func([]string) error {
			client, err := git.ClientFromCLIConfig()
			if nil != err {
				return err
			}
			r, err := git.NewRepo(client, *owner, *repo)
			if nil!=err {
				return err
			}
			defer r.Close()
			watchers, err := r.ListWatchers()
			if nil!=err {
				return err
			}
			for _, u := range watchers {
				fmt.Println(*u.Login)
			}
			return nil
		})
}