package git

import (
	git2go "gopkg.in/libgit2/git2go.v25"
	// "ebw/util"
)

type IndexFileStatus struct {
	*git2go.StatusEntry
}

type IndexFileStatusAbbreviated struct {
	Path   string
	Status string
}

func NewIndexFileStatus(se git2go.StatusEntry) *IndexFileStatus {
	return &IndexFileStatus{&se}
}

func (ifs *IndexFileStatus) Abbreviated() *IndexFileStatusAbbreviated {
	return &IndexFileStatusAbbreviated{
		Path:   ifs.Path(),
		Status: ifs.StatusString(),
	}
}

func (ifs *IndexFileStatus) Path() string {
	path := ifs.HeadToIndex.OldFile.Path
	if `` == path {
		path = ifs.HeadToIndex.NewFile.Path
	}
	return path
}

func (ifs *IndexFileStatus) StatusString() string {
	return StatusEntryStatusToString(ifs.Status)
}

func DeltaToString(d git2go.Delta) string {
	switch d {
	case git2go.DeltaUnmodified:
		return "unmodified"
	case git2go.DeltaAdded:
		return "added"
	case git2go.DeltaDeleted:
		return "deleted"
	case git2go.DeltaModified:
		return "modified"
	case git2go.DeltaRenamed:
		return "renamed"
	case git2go.DeltaCopied:
		return "copied"
	case git2go.DeltaIgnored:
		return "ignored"
	case git2go.DeltaUntracked:
		return "untracked"
	case git2go.DeltaTypeChange:
		return "typechange"
	case git2go.DeltaUnreadable:
		return "unreadable"
	case git2go.DeltaConflicted:
		return "conflicted"
	}
	return "delta--unrecognized"
}

func StatusEntryStatusToString(s git2go.Status) string {
	switch s {
	case git2go.StatusCurrent:
		return "current"
	case git2go.StatusIndexNew:
		return "index-new"
	case git2go.StatusIndexModified:
		return "index-modified"
	case git2go.StatusIndexDeleted:
		return "index-deleted"
	case git2go.StatusIndexRenamed:
		return "index-renamed"
	case git2go.StatusIndexTypeChange:
		return "index-typechange"
	case git2go.StatusWtNew:
		return "wt-new"
	case git2go.StatusWtModified:
		return "wt-modified"
	case git2go.StatusWtDeleted:
		return "wt-deleted"
	case git2go.StatusWtTypeChange:
		return "wt-typechange"
	case git2go.StatusWtRenamed:
		return "wt-renamed"
	case git2go.StatusIgnored:
		return "ignored"
	case git2go.StatusConflicted:
		return "conflicted"
	}
	return "statusentrystatus--unrecognized"

}
