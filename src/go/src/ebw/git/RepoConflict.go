package git

import (
	"encoding/json"
	"errors"
	// "fmt"

	// "github.com/google/go-github/github"
	// "github.com/sirupsen/logrus"
	git2go "gopkg.in/libgit2/git2go.v25"
	// "ebw/util"
)

// RepoConflict provides details on a conflicted file
// in the repo.
type RepoConflict struct {
	Path          string
	Automergeable bool
	Status        git2go.Status
}

func (rc *RepoConflict) String() string {
	raw, _ := json.Marshal(rc)
	return string(raw)
}

// ListRepoConflicts lists all the conflicted files in the repo. The repo must be in a Merge state
// in order for there to be conflicted files at all.
func (r *Repo) ListRepoConflicts() ([]*RepoConflict, error) {
	conflicts := []*RepoConflict{}
	// If the repo isn't in a merge state, we don't have any repo conflicts
	if r.Repository.State()&git2go.RepositoryStateMerge != git2go.RepositoryStateMerge {
		return nil, errors.New(`Repository is not in a MERGE state`)
	}
	sl, err := r.Repository.StatusList(&git2go.StatusOptions{
		Show: git2go.StatusShowWorkdirOnly,
		// Flags: g
	})
	if nil != err {
		return nil, r.Error(err)
	}
	defer sl.Free()
	entryCount, err := sl.EntryCount()
	if nil != err {
		return nil, r.Error(err)
	}
	for i := 0; i < entryCount; i++ {
		se, err := sl.ByIndex(i)
		if nil != err {
			return nil, r.Error(err)
		}
		if se.Status&git2go.StatusConflicted == git2go.StatusConflicted {
			conflicts = append(conflicts, &RepoConflict{Path: DiffDeltaPath(se.IndexToWorkdir),
				Automergeable: false, Status: se.Status})
		}
	}
	return conflicts, nil
}

// DiffDeltaPath returns the path from a DiffDelta, selecting the OldFile by preference,
// or the NewFile if the OldFile is not defined
func DiffDeltaPath(dd git2go.DiffDelta) string {
	if `` != dd.OldFile.Path {
		return dd.OldFile.Path
	}
	return dd.NewFile.Path
}
