package git

import (
	// "fmt"

	git2go "gopkg.in/libgit2/git2go.v25"
)

// GitRepoState wraps the state of a repo.
type GitRepoState struct {
	RepositoryState git2go.RepositoryState
}

func (rs *GitRepoState) String() string {
	switch rs.RepositoryState {
	case git2go.RepositoryStateNone:
		return "git2go.RepositoryStateNone"
	case git2go.RepositoryStateMerge:
		return "git2go.RepositoryStateMerge"
	case git2go.RepositoryStateRevert:
		return "git2go.RepositoryStateRevert"
	case git2go.RepositoryStateCherrypick:
		return "git2go.RepositoryStateCherrypick"
	case git2go.RepositoryStateBisect:
		return "git2go.RepositoryStateBisect"
	case git2go.RepositoryStateRebase:
		return "git2go.RepositoryStateRebase"
	case git2go.RepositoryStateRebaseInteractive:
		return "git2go.RepositoryStateRebaseInteractive"
	case git2go.RepositoryStateRebaseMerge:
		return "git2go.RepositoryStateRebaseMerge"
	case git2go.RepositoryStateApplyMailbox:
		return "git2go.RepositoryStateApplyMailbox"
	case git2go.RepositoryStateApplyMailboxOrRebase:
		return "git2go.RepositoryStateApplyMailboxOrRebase"
	}
	return "git2go.State-UNKNOWN-"
}

// RepoState returns the state of the repo. Per
// https://libgit2.github.com/libgit2/#HEAD/group/repository/git_repository_state
// this determines the status of a git repository - ie, whether an operation (merge, cherry-pick, etc) is in progress.
func (g *Git) RepoState() *GitRepoState {
	return &GitRepoState{
		g.Repository.State(),
	}
}

// HasConflicts returns true if the repo has conflicted files
func (g *Git) HasConflicts() (bool, error) {
	index, err := g.Repository.Index()
	if nil != err {
		return false, g.Error(err)
	}
	defer index.Free()
	return index.HasConflicts(), nil
}

// IsFileConflicted returns true if the file at the given path is in a conflicted
// state.
func (g *Git) IsFileConflicted(path string) (bool, error) {
	// conflict is a state that exists inside the index.
	index, err := g.Repository.Index()
	if nil != err {
		return false, g.Error(err)
	}
	defer index.Free()
	_, err = index.GetConflict(path)
	if nil != err {
		if git2go.IsErrorCode(err, git2go.ErrNotFound) {
			return false, nil
		}
		return false, g.Error(err)
	}
	return true, nil
	// i, err := index.EntryByPath(path)
	// if nil != err {
	// 	return false, g.Error(err)
	// }
	// entry, err := index.EntryByIndex(i)
	// if nil != err {
	// 	return false, g.Error(err)
	// }
	// defer entry.Free()
	// return entry.Is
	// return false, g.Error(fmt.Errorf(`Not implemented`))
}

// IsMerging returns true if the repo is merging
func (g *Git) IsMerging() bool {
	return g.Repository.State() == git2go.RepositoryStateMerge
}
