package git

import (
	"fmt"
	"strings"

	git2go "gopkg.in/libgit2/git2go.v25"
)

// FileDiff contains a difference between two versions of a single file
type FileDiff struct {
	Delta *git2go.DiffDelta
}

func (t *FileDiff) Close() {
}

// Path returns the path of the file in the FileDiff deltas,
// preferring the old path to the new path
func (t *FileDiff) Path() string {
	if `` != t.Delta.OldFile.Path {
		return t.Delta.OldFile.Path
	}
	return t.Delta.NewFile.Path
}

func (t *FileDiff) OldFileExists() bool {
	return git2go.DiffFlagExists&t.Delta.OldFile.Flags == git2go.DiffFlagExists
}
func (t *FileDiff) NewFileExists() bool {
	return git2go.DiffFlagExists&t.Delta.NewFile.Flags == git2go.DiffFlagExists
}

// DiffFlagToString returns a string representation of a git2go.DiffFlag
func DiffFlagToString(f git2go.DiffFlag) string {
	p := []string{}
	for c, s := range map[git2go.DiffFlag]string{
		git2go.DiffFlagBinary:    "binary",
		git2go.DiffFlagNotBinary: "not-binary",
		git2go.DiffFlagValidOid:  "valid-oid",
		git2go.DiffFlagExists:    "exists",
	} {
		if f&c == c {
			p = append(p, s)
		}
	}
	return strings.Join(p, `,`)
}

func (t *FileDiff) String() string {
	return fmt.Sprintf("%s: %s (%s) - %s (%s)", DeltaToString(t.Delta.Status),
		t.Delta.OldFile.Path, DiffFlagToString(t.Delta.OldFile.Flags),
		t.Delta.NewFile.Path, DiffFlagToString(t.Delta.NewFile.Flags))
}

// writeConflict creates a conflict in the Index between the versions of
// the file supplied.
func (g *Git) writeConflict(index *git2go.Index, baseTree *git2go.Tree, t *FileDiff) error {
	var err error
	var baseOid *git2go.Oid

	path := t.Path()

	baseTreeEntry, err := baseTree.EntryByPath(t.Path())
	if nil != err {
		if !git2go.IsErrorCode(err, git2go.ErrNotFound) {
			return g.Error(err)
		}
	} else {
		baseOid = baseTreeEntry.Id
	}

	// nil entry implies the file does not exist
	var ancestor, our, their *git2go.IndexEntry
	if nil != baseTreeEntry {
		ancestor = &git2go.IndexEntry{Path: path, Id: baseOid, Mode: git2go.FilemodeBlob}
	}
	if t.OldFileExists() {
		our = &git2go.IndexEntry{Path: path, Id: t.Delta.OldFile.Oid, Mode: git2go.FilemodeBlob}
	}
	if t.NewFileExists() {
		their = &git2go.IndexEntry{Path: path, Id: t.Delta.NewFile.Oid, Mode: git2go.FilemodeBlob}
	}

	fmt.Printf("%s: %s ->>  %s -- %s\n", t.Path(), baseOid.String(), t.Delta.OldFile.Oid.String(),
		t.Delta.NewFile.Oid.String())

	if err := index.AddConflict(ancestor, our, their); nil != err {
		return g.Error(err)
	}
	return nil
}

// CommitFileDiffs returns a slice of FileDiffs for all differences between the
// two commits. oldObject an dnewObject need to be objects that can resolve to Trees / Commits.
func (g *Git) CommitFileDiffs(oldObject, newObject *git2go.Object) ([]*FileDiff, error) {
	oldTree, err := g.objectToTree(oldObject)
	if nil != err {
		return nil, err
	}
	defer oldTree.Free()
	newTree, err := g.objectToTree(newObject)
	if nil != err {
		return nil, err
	}
	defer newTree.Free()

	diffOptions, err := git2go.DefaultDiffOptions()
	if nil != err {
		return nil, g.Error(err)
	}
	diff, err := g.Repository.DiffTreeToTree(oldTree, newTree, &diffOptions)
	if nil != err {
		return nil, g.Error(err)
	}
	defer diff.Free()
	numDeltas, err := diff.NumDeltas()
	if nil != err {
		return nil, g.Error(err)
	}
	deltas := make([]*FileDiff, numDeltas)
	for i := 0; i < numDeltas; i++ {
		delta, err := diff.GetDelta(i)
		if nil != err {
			return nil, g.Error(err)
		}
		deltas[i] = &FileDiff{Delta: &delta}
	}
	return deltas, nil
}

// ConflictFileDiffs sets all file differences between the two supplied commits
// to a conflict state.
func (g *Git) ConflictFileDiffs(oldCommitObject, newCommitObject *git2go.Object) error {
	oldCommit, err := g.objectToCommit(oldCommitObject)
	if nil != err {
		return err
	}
	defer oldCommit.Free()
	newCommit, err := g.objectToCommit(newCommitObject)
	if nil != err {
		return err
	}
	defer newCommit.Free()
	baseOid, err := g.Repository.MergeBase(oldCommit.Id(), newCommit.Id())
	if nil != err {
		return g.Error(err)
	}
	baseObj, err := g.Repository.Lookup(baseOid)
	if nil != err {
		return g.Error(err)
	}
	defer baseObj.Free()
	baseTree, err := g.objectToTree(baseObj)
	if nil != err {
		return g.Error(err)
	}
	defer baseTree.Free()

	diffs, err := g.CommitFileDiffs(oldCommitObject, newCommitObject)
	if nil != err {
		return err
	}
	index, err := g.Repository.Index()
	if nil != err {
		return g.Error(err)
	}
	defer index.Free()
	for _, d := range diffs {
		if err := g.writeConflict(index, baseTree, d); nil != err {
			return err
		}
	}
	if err := index.Write(); nil != err {
		return g.Error(err)
	}
	return nil
}
