package git

import (
	"strings"

	git2go "gopkg.in/libgit2/git2go.v25"
)

func GitMergeAnalysisToString(a git2go.MergeAnalysis) string {
	s := []string{}
	for b, str := range map[git2go.MergeAnalysis]string{
		git2go.MergeAnalysisNone:        "MergeAnalysisNone",
		git2go.MergeAnalysisNormal:      "MergeAnalysisNormal",
		git2go.MergeAnalysisUpToDate:    "MergeAnalysisUpToDate",
		git2go.MergeAnalysisFastForward: "MergeAnalysisFastForward",
		git2go.MergeAnalysisUnborn:      "MergeAnalysisUnborn",
	} {
		if a&b == b {
			s = append(s, str)
		}
	}
	return strings.Join(s, "|")
}

func GitMergePreferenceToString(a git2go.MergePreference) string {
	s := []string{}
	for b, str := range map[git2go.MergePreference]string{
		git2go.MergePreferenceNone:            "MergePreferenceNone",
		git2go.MergePreferenceNoFastForward:   "MergePreferenceNoFastFoward",
		git2go.MergePreferenceFastForwardOnly: "MergePreferenceFastFowardOnly",
	} {
		if a&b == b {
			s = append(s, str)
		}
	}
	return strings.Join(s, "|")
}

func GitStatusToString(status git2go.Status) string {
	s := []string{}
	if status == git2go.StatusCurrent {
		return "StatusCurrent"
	}
	for b, str := range map[git2go.Status]string{
		git2go.StatusIndexNew:        "StatusIndexNew",
		git2go.StatusIndexModified:   "StatusIndexModified",
		git2go.StatusIndexDeleted:    "StatusIndexDeleted",
		git2go.StatusIndexRenamed:    "StatusIndexRenamed",
		git2go.StatusIndexTypeChange: "StatusIndexTypeChange",
		git2go.StatusWtNew:           "StatusWtNew",
		git2go.StatusWtModified:      "StatusWtModified",
		git2go.StatusWtDeleted:       "StatusWtDeleted",
		git2go.StatusWtTypeChange:    "StatusWtTypeChange",
		git2go.StatusWtRenamed:       "StatusWtRenamed",
		git2go.StatusIgnored:         "StatusIgnored",
		git2go.StatusConflicted:      "StatusConflicted",
	} {
		if status&b == b {
			s = append(s, str)
		}
	}
	return strings.Join(s, "|")
}

func GitRepositoryStateToString(state git2go.RepositoryState) string {
	switch state {
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

// objectToTree converts a git2go.Object into a Tree
func (g *Git) objectToTree(obj *git2go.Object) (*git2go.Tree, error) {
	treeObj, err := obj.Peel(git2go.ObjectTree)
	if nil != err {
		return nil, g.Error(err)
	}
	defer treeObj.Free()
	tree, err := treeObj.AsTree()
	if nil != err {
		return nil, g.Error(err)
	}
	return tree, nil
}

// objectToCommit converts a git2go.Object to a git2go.Commit
func (g *Git) objectToCommit(obj *git2go.Object) (*git2go.Commit, error) {
	commitObj, err := obj.Peel(git2go.ObjectCommit)
	if nil != err {
		return nil, g.Error(err)
	}
	defer commitObj.Free()
	commit, err := commitObj.AsCommit()
	if nil != err {
		return nil, g.Error(err)
	}
	return commit, nil
}

// objectToCommitAndTree converts an object to both a git2go Commit and git2go Tree
func (g *Git) objectToCommitAndTree(obj *git2go.Object) (*git2go.Commit, *git2go.Tree, error) {
	commit, err := g.objectToCommit(obj)
	if nil != err {
		return nil, nil, err
	}
	tree, err := g.objectToTree(obj)
	if nil != err {
		return nil, nil, err
	}
	return commit, tree, nil
}
