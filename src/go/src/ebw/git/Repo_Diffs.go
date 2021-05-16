package git

import (
	"fmt"
	"os"

	// "github.com/google/go-github/github"
	// "github.com/sirupsen/logrus"
	git2go "github.com/craigmj/git2go/v31"
)

type DiffDeltaType int

const (
	HeadToIndex DiffDeltaType = 1 << iota
	IndexToWt
)

// DiffDelta is a wrapper around git2go.DiffDelta
type DiffDelta struct {
	Type DiffDeltaType
	git2go.DiffDelta
}

func (rd *DiffDelta) String() string {
	var path string
	if nil != rd.OldFile.Oid && !rd.OldFile.Oid.IsZero() {
		path = rd.OldFile.Path
	} else {
		// If we don't have an OldFile, then this is a new
		// file... so we probably want to delete it...
		path = rd.NewFile.Path
	}
	return fmt.Sprintf(`%12s: %s`, rd.StatusString(), path)
}

func (rd *DiffDelta) StatusString() string {
	for k, v := range map[git2go.Delta]string{
		git2go.DeltaUnmodified: `unmodified`,
		git2go.DeltaAdded:      `added`,
		git2go.DeltaDeleted:    `deleted`,
		git2go.DeltaModified:   `modified`,
		git2go.DeltaRenamed:    `renamed`,
		git2go.DeltaCopied:     `copied`,
		git2go.DeltaIgnored:    `ignored`,
		git2go.DeltaUntracked:  `untracked`,
		git2go.DeltaTypeChange: `typechange`,
		// git2go.DeltaUnreachable: `unreachable`,
		git2go.DeltaConflicted: `conflicted`,
	} {
		if rd.Status == k {
			return v
		}
	}
	return fmt.Sprintf(`unknown delta %d`, rd.Status)
}

// RevertDiffDelta reverts the DiffDelta on this repo.
func (r *Repo) RevertDiffDelta(rd *DiffDelta) error {
	if rd.Type != IndexToWt {
		return fmt.Errorf(`Revert HeadToIndex not supported`)
	}
	switch rd.Status {
	case git2go.DeltaUnmodified:
		return nil
	case git2go.DeltaAdded:
		err := os.Remove(r.RepoPath(rd.NewFile.Path))
		if nil != err {
			return r.Error(err)
		}
		return nil
	case git2go.DeltaDeleted:
		fallthrough
	case git2go.DeltaModified:
		fallthrough
	case git2go.DeltaTypeChange:
		if err := r.RunGit(`checkout`, `--`, rd.OldFile.Path); nil != err {
			return r.Error(err)
		}
		return nil
	case git2go.DeltaRenamed:
		return fmt.Errorf(`Revert on DeltaRenamed not implemented`)
	case git2go.DeltaCopied:
		return fmt.Errorf(`Revert on DeltaCopied not implemented`)
	case git2go.DeltaIgnored:
		fallthrough
	case git2go.DeltaUntracked:
		if err := os.Remove(r.RepoPath(rd.NewFile.Path)); nil != err {
			return r.Error(err)
		}
		return nil
	case git2go.DeltaConflicted:
		return fmt.Errorf(`Revert on DeltaConflicted not implemented`)
	}
	return nil
}

// DiffsIndexToWt returns the RepoDiffs for the difference between the
// index and the working tree.
func (r *Repo) DiffsIndexToWt() ([]*DiffDelta, error) {
	return r.Git.ListDiffsIndexToWt()
}

// isWorktreeStatus returns true if the given status relates to a
// Worktree item.
func isWorktreeStatus(status git2go.Status) bool {
	for _, s := range []git2go.Status{
		git2go.StatusWtNew,
		git2go.StatusWtModified,
		git2go.StatusWtDeleted,
		git2go.StatusWtTypeChange,
		git2go.StatusWtRenamed,
	} {
		if status&s == s {
			return true
		}
	}
	return false
}
