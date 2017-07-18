package git

import (
	"strings"
)

// RepoState describes the state of the repo with regard to it's
// GitHub origin repo, and the parent of that GitHub repo.
type RepoState int

const (
	// The EMB system is in-sync with its Github repo
	EBMInSync = 1 << iota
	// There are staged changes on the EBM that been pushed to Github
	EBMChangesStaged
	// There are unstaged changes on the EBM
	EBMChangesUnstaged
	// EBM is in merged state, and conflicts need to be resolved
	EBMConflicted
	// There are changes on Github that haven't propagated to EBM
	EBMBehind
	// Commits on EBM haven't been propagated to Github. This is perhaps a theoretical
	// consideration, since design suggests no commits happen on EBM that aren't at
	// once pushed.
	EBMAhead
	// EBMUnimplemented is a Git state that EBM cannot handle. This will need to be
	// looked at if we encounter any of these.
	EBMUnimplemented

	// The GitHub repo is the source, and has no parent
	ParentNotExist
	// The parent of the GitHub repo is ahead of the GitHub repo
	ParentAhead
	// The parent of the GitHub repo is behind the GitHub repo: need to issue a PR
	ParentBehind
	// The parent of the GitHub repo, and the GitHub repo are in sync.
	// ParentInSync = (0==(state & (ParentAhead|ParentBehind|ParentNotExist)))
	ParentInSync
	StateNotSet
)

func (rs RepoState) LocalInSync() bool {
	return 0 == rs&(EBMChangesStaged|EBMChangesUnstaged|EBMConflicted|EBMBehind|EBMAhead|EBMUnimplemented)
}
func (rs RepoState) LocalChanges() bool {
	return rs.LocalChangesStaged() || rs.LocalChangesUnstaged()
}
func (rs RepoState) LocalChangesStaged() bool {
	return 0 < rs&EBMChangesStaged
}
func (rs RepoState) LocalChangesUnstaged() bool {
	return 0 < rs&EBMChangesUnstaged
}
func (rs RepoState) LocalConflicted() bool {
	return 0 < rs&EBMConflicted
}
func (rs RepoState) LocalBehind() bool {
	return 0 < rs&EBMBehind
}
func (rs RepoState) LocalAhead() bool {
	return 0 < rs&EBMAhead
}
func (rs RepoState) LocalUnimplemented() bool {
	return 0 < rs&EBMUnimplemented
}
func (rs RepoState) ParentNotExist() bool {
	return 0 < rs&ParentNotExist
}
func (rs RepoState) ParentAhead() bool {
	return 0 < rs&ParentAhead
}
func (rs RepoState) ParentBehind() bool {
	return 0 < rs&ParentBehind
}
func (rs RepoState) ParentInSync() bool {
	return 0 == (rs & (ParentAhead | ParentBehind | ParentNotExist))
}

func (rs RepoState) String() string {
	states := []string{}
	for v, s := range map[RepoState]string{
		EBMInSync:          "EBMInSync",
		EBMChangesStaged:   "EBMChangesStaged",
		EBMChangesUnstaged: "EBMChangesUnstaged",
		EBMConflicted:      "EBMConflicted",

		EBMBehind: "EBMBehind",
		EBMAhead:  "EBMAhead",

		EBMUnimplemented: "EMBUnimplemented",
		ParentNotExist:   "ParentNotExist",
		ParentAhead:      "ParentAhead",
		ParentBehind:     "ParentBehind",
		ParentInSync:     "ParentInSync",
	} {
		if int(rs)&int(v) == int(v) {
			states = append(states, s)
		}
	}
	return strings.Join(states, `,`)
}
