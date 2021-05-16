package git

import (
	git2go "github.com/craigmj/git2go/v31"

	"ebw/util"
)

// FetchRemote fetches all branches of the remote. It is the caller's responsibility
// to .Free the returned *Remote.
func FetchRemote(repo *git2go.Repository, remoteName string) (*git2go.Remote, error) {
	// We're assuming that our configured repo has the right permissions,
	// which we should probably check
	remote, err := repo.Remotes.Lookup(remoteName)
	if nil != err {
		return nil, util.Error(err)
	}
	if err := remote.Fetch([]string{}, nil, ``); nil != err {
		return nil, util.Error(err)
	}
	return remote, nil
}

func FetchRemoteForRepo(client *Client, repoOwner, repoName, remoteName string) (*git2go.Remote, error) {
	repoDir, err := RepoDir(client.Username, repoOwner, repoName)
	if nil != err {
		return nil, err
	}
	return FetchRemoteForRepoDir(client, repoDir, remoteName)
}

func FetchRemoteForRepoDir(client *Client, repoDir string, remoteName string) (*git2go.Remote, error) {
	repo, err := git2go.OpenRepository(repoDir)
	if nil != err {
		return nil, util.Error(err)
	}
	defer repo.Free()
	remote, err := FetchRemote(repo, remoteName)
	if nil != err {
		return nil, err
	}
	return remote, nil
}
