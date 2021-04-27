package git

import (
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"
	"strings"

	git2go "github.com/libgit2/git2go/v31"
)

type MergeResolution int

const (
	// ResolveAutomatically will attempt to auto-merge
	// all files. If a file can be auto-merged, it will be added to the
	// index and wd in a resolved state, and marked as resolved in the index.
	// If the file cannot be automatically resolved, it will be marked as
	// conflicted in the index, and the WD will contain the git-merge
	// result.
	ResolveAutomatically MergeResolution = 1
	// ResolveConficted will leave all files in the merge in a
	// conflicted state, even in the situation where Git might have been
	// able to resolve the merge.
	ResolveConflicted = 2
)

// FileDiff contains a difference between two versions of a single file
type FileDiff struct {
	Delta *git2go.DiffDelta
}

func (t *FileDiff) OldFileOidString() string {
	if nil == t.Delta.OldFile.Oid {
		return "-"
	}
	return t.Delta.OldFile.Oid.String()
}
func (t *FileDiff) NewFileOidString() string {
	if nil == t.Delta.NewFile.Oid {
		return "-"
	}
	return t.Delta.NewFile.Oid.String()
}

func (t *FileDiff) Close() {
	// Don't need to do anything here
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
	if nil == index {
		return g.Error(fmt.Errorf("index is nil"))
	}
	if nil == baseTree {
		return g.Error(fmt.Errorf("baseTree is nil"))
	}
	if nil == t {
		return g.Error(fmt.Errorf("FileDiff is nil"))
	}
	var err error
	var baseOid *git2go.Oid
	path := t.Path()

	baseTreeEntry, err := baseTree.EntryByPath(t.Path())
	if nil != err {
		if !git2go.IsErrorCode(err, git2go.ErrNotFound) {
			return g.Error(err)
		}
	} else {
		if nil == baseTreeEntry {
			return g.Error(fmt.Errorf("baseTreeEntry is nil"))
		}
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
	if err := index.AddConflict(ancestor, our, their); nil != err {
		return g.Error(err)
	}
	return nil
}

// CommitFileDiffs returns a slice of FileDiffs for all differences between the
// two commits. oldObject and newObject need to be objects that can resolve to Trees / Commits.
// If null==oldObject, oldObject will be set to the current repo HEAD.
func (g *Git) CommitFileDiffs(oldObject, newObject *git2go.Object) ([]*FileDiff, error) {
	var err error
	if nil == oldObject {
		oldObject, err = g.GetBranch(`HEAD`)
		if nil != err {
			return nil, err
		}
	}
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
// to a conflict state. If nil==oldCommitObject, oldCommitObject will be set to the
// current repo's HEAD
func (g *Git) ConflictFileDiffs(oldCommitObject, newCommitObject *git2go.Object) error {
	var err error
	if nil == oldCommitObject {
		oldCommitObject, err = g.GetBranch(`HEAD`)
		if nil != err {
			return err
		}
	}
	if nil == oldCommitObject {
		return g.Error(fmt.Errorf("oldCommitObject is nil"))
	}
	oldCommit, err := g.objectToCommit(oldCommitObject)
	if nil != err {
		return err
	}
	if nil == oldCommit {
		return g.Error(fmt.Errorf("oldCommit is nil"))
	}
	defer oldCommit.Free()
	newCommit, err := g.objectToCommit(newCommitObject)
	if nil != err {
		return err
	}
	if nil == newCommit {
		return g.Error(fmt.Errorf("newCommit is nil"))
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

// writeTheirsForConflictedFiles writes the `their` version of all conflicted
// files for this repo.
func (g *Git) writeTheirsForConflictedFiles(commitObject *git2go.Object) error {
	return g.writeConflictedFiles(commitObject,
		func(c git2go.IndexConflict) *git2go.IndexEntry {
			return c.Their
		}, g.PathTheir)
}

// writeOursForConflictedFiles writes the `our` version of all conflicted
// files for this repo.
func (g *Git) writeOursForConflictedFiles() error {
	head, err := g.GetBranch(`HEAD`)
	if nil != err {
		return err
	}
	defer head.Free()
	return g.writeConflictedFiles(head, func(c git2go.IndexConflict) *git2go.IndexEntry {
		return c.Our
	}, g.Path)
}

// writeConflictedFiles is a generic method to write all the conflicted files in the
// repo with version from the commitObject, entry chosen with the chooseEntry function,
// and the destination path computed with the pathfn.
// This method is only really intended for use from the writeOursForConflictedFiles() and the
// writeTheirForConflictedFiles(..) methods.
func (g *Git) writeConflictedFiles(commitObject *git2go.Object,
	chooseEntry func(git2go.IndexConflict) *git2go.IndexEntry, pathfn func(path ...string) string) error {
	return g.WalkConflicts(func(conflict git2go.IndexConflict) error {
		entry := chooseEntry(conflict)
		if nil != entry {
			if nil != entry.Id && !entry.Id.IsZero() {
				// we've got a solid file we can write
				fmt.Println(`writeConflictedFiles reading `, entry.Path)
				raw, err := g.readPathForTreeObject(commitObject, entry.Path)
				if nil != err {
					if git2go.IsErrorCode(err, git2go.ErrNotFound) {
						// We didn't find the path in the commit object.
						// This should not occur - so for now we'll report an error
						err = fmt.Errorf(`Failed to find %s in commit object`, entry.Path)
						// os.Remove(pathfn(entry.Path))
						return g.Error(err)
					}
					return err
				}
				dest := pathfn(entry.Path)
				fmt.Println(`writeConflictedFIles writing`, dest)
				os.MkdirAll(filepath.Dir(dest), 0755)
				if err := ioutil.WriteFile(dest, raw, 0644); nil != err {
					return g.Error(fmt.Errorf(`Failed writing '%s': %s`, dest, err.Error()))
				}
				return nil
			}
			// We don't have an entry Id - implies this file does not exist, so we delete
			// it. We don't worry if there's an error - after all, it might no be there
			fmt.Println(`writeConflictedFiles deleting`, pathfn(entry.Path))
			os.Remove(pathfn(entry.Path))
			return nil
		}
		// the entry we have chosen is nil. We need to make sure we don't have
		// such a file.
		path := ``
		if nil != conflict.Our {
			path = conflict.Our.Path
		}
		if `` == path {
			path = conflict.Their.Path
		}
		// delete the file if it exists
		fmt.Println(`writeConflictdFiles deleting (pt2)`, pathfn(path))
		os.Remove(pathfn(path))
		return nil
	})
}
