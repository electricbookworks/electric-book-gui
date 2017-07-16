package cli

import (
	"os"

	"ebw/git"
	"ebw/util"
)

// cliRepo returns the repo for the current wd, configured for the appropriate CLI client
func cliRepo() (*git.Repo, error) {
	workingDir, err := os.Getwd()
	if nil != err {
		return nil, util.Error(err)
	}
	client, err := git.ClientFromCLIConfig()
	if nil != err {
		return nil, err
	}
	repo, err := git.NewRepoForDir(client, workingDir, true)
	if nil != err {
		return nil, err
	}
	return repo, nil
}
