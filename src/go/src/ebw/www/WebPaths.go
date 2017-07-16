package www

import (
	"fmt"

	"ebw/git"
)

func pathRepoDetail(repo *git.Repo) string {
	return fmt.Sprintf("/repo/%s/%s/detail", repo.RepoOwner, repo.RepoName)
}

func pathRepoConflict(repo *git.Repo) string {
	return fmt.Sprintf("/repo/%s/%s/conflict", repo.RepoOwner, repo.RepoName)
}

func pathMergeRemote(repo *git.Repo, remoteName, remoteBranch string) string {
	return fmt.Sprintf("/repo/%s/%s/merge/%s/%s", repo.RepoOwner, repo.RepoName, remoteName, remoteBranch)
}
