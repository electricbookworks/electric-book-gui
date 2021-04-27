package git

import (
	"bytes"
	"path/filepath"
	"fmt"
	"html"
	"strings"

	git2go "github.com/libgit2/git2go/v31"
	"github.com/juju/errors"
	"github.com/golang/glog"
	"github.com/sergi/go-diff/diffmatchpatch"

	"ebw/util"
)
var _ = errors.New
var _ = glog.Infof

const (
	COMMIT_DIFF_ADD  = `add`
	COMMIT_DIFF_DELETE = `delete`
	COMMIT_DIFF_CHANGE = `change`
	COMMIT_DIFF_RENAME = `rename`
	COMMIT_DIFF_OTHER = `other`
	COMMIT_DIFF_UNCHANGED = `unchanged`
	)


// commitDiffFile contains a single file for 
// a commit difference
type commitDiffFile struct {
	Path string
	OID string
}

func (c *commitDiffFile) GetPath() string {
	if nil==c {
		return ``
	}
	return c.Path
}
func (c *commitDiffFile) GetOID() string {
	if nil==c {
		return `0`
	}
	return c.OID
}
func (c *commitDiffFile) OIDPath() string {
	return c.GetOID() + filepath.Ext(c.GetPath())
}

// commitDiff is a difference between 
// two commits
// State describes the state of the file. For the purposes
// of EBM, we permit the following, lower-case
// values (`add`,`delete`,`change`,`rename`,`other`)
type commitDiff struct {
	Path string
	OID string
	Index int
	State string
	URL string
	Old *commitDiffFile
	New *commitDiffFile
}

func (cd *commitDiff) getURL(fromCommit, toCommit string) string {
	if true {
		switch cd.State {
			case COMMIT_DIFF_CHANGE:
				return fmt.Sprintf(`diff/%s/%s/%d`, fromCommit, toCommit, cd.Index)
				// return fmt.Sprintf(`diff-diff/%s/%s`, cd.Old.OID, cd.New.OID)
			case COMMIT_DIFF_ADD:
				return fmt.Sprintf(`diff-serve/%s`, cd.New.OID)
			case COMMIT_DIFF_DELETE:
				return fmt.Sprintf(`diff-serve/%s`, cd.Old.OID)
			case COMMIT_DIFF_RENAME:
				fallthrough
			case COMMIT_DIFF_OTHER:
				fallthrough
			case COMMIT_DIFF_UNCHANGED:
				return fmt.Sprintf(`diff-serve/%s`, cd.OID)
		}
		return "-unknown"
	}
	if -1<cd.Index {
		return fmt.Sprintf(`diff/%s/%s/%d`, fromCommit, toCommit, cd.Index)
	}
	return fmt.Sprintf(`diff-serve/%s`, cd.OID)
}

func (cd *commitDiff) Unchanged() bool {
	return nil==cd.Old && nil==cd.New
}

func (g *Git) IdToTree(id string) (*git2go.Tree, error) {
	treeId, err := git2go.NewOid(id)
	if nil!=err {
		return nil, util.Error(err)
	}
	t, err := g.Repository.LookupTree(treeId)
	if nil!=err {
		return nil, util.Error(err)
	}
	return t, nil
}

// CommitDiffs returns the differences between the two commits
// stored as fromOID and toOID
func (g *Git) CommitDiffs(fromOID, toOID string) ([]*commitDiff, error) {
	fromTreeID, err := git2go.NewOid(fromOID)
	if nil!=err {
		return nil, util.Error(err)
	}
	toTreeID, err := git2go.NewOid(toOID)
	if nil!=err {
		return nil, util.Error(err)
	}
	fromTree, err := g.Repository.LookupTree(fromTreeID)
	if nil!=err {
		return nil, util.Error(err)
	}
	defer fromTree.Free()

	toTree, err := g.Repository.LookupTree(toTreeID)
	if nil!=err {
		return nil, util.Error(err)
	}
	defer toTree.Free()

	diffOptions, err := git2go.DefaultDiffOptions()
	if nil!=err {
		return nil, util.Error(err)
	}
	diff, err := g.Repository.DiffTreeToTree(fromTree, toTree, 
		&diffOptions)
	if nil!=err {
		return nil, util.Error(err)
	}
	defer diff.Free()

	ndelta, err := diff.NumDeltas()
	if nil!=err {
		return nil, util.Error(err)
	}
	changeMap := map[string]*commitDiff{}
	changes := make([]*commitDiff, ndelta)
	for i:=0; i<ndelta; i++ {
		delta, err := diff.GetDelta(i)
		if nil!=err {
			return nil, util.Error(err)
		}
		change := &commitDiff{
			Index: i,
		}
		switch delta.Status {
		case git2go.DeltaAdded:
			change.State = COMMIT_DIFF_ADD
			change.New = &commitDiffFile{
				Path: delta.NewFile.Path,
				OID: delta.NewFile.Oid.String(),
			}
			change.Path = delta.NewFile.Path
		case git2go.DeltaDeleted:
			change.State = COMMIT_DIFF_DELETE
			change.Old = &commitDiffFile{
				Path:delta.OldFile.Path,
				OID: delta.OldFile.Oid.String(),
			}
			change.Path = delta.OldFile.Path
		case git2go.DeltaModified:			
			change.State = COMMIT_DIFF_CHANGE
			change.Old = &commitDiffFile{
				Path:delta.OldFile.Path,
				OID: delta.OldFile.Oid.String(),
			}
			change.New = &commitDiffFile{
				Path: delta.NewFile.Path,
				OID: delta.NewFile.Oid.String(),
			}
			change.Path = delta.NewFile.Path
		case git2go.DeltaRenamed:
			change.State = COMMIT_DIFF_RENAME
			change.Old = &commitDiffFile{
				Path:delta.OldFile.Path,
				OID: delta.OldFile.Oid.String(),
			}
			change.New = &commitDiffFile{
				Path: delta.NewFile.Path,
				OID: delta.NewFile.Oid.String(),
			}
			change.Path = delta.NewFile.Path
		default:
			change.State = COMMIT_DIFF_OTHER
			change.Old = &commitDiffFile{
				Path:delta.OldFile.Path,
				OID: delta.OldFile.Oid.String(),
			}
			change.New = &commitDiffFile{
				Path: delta.NewFile.Path,
				OID: delta.NewFile.Oid.String(),
			}
			change.Path = delta.NewFile.Path
		}
		changes[i] = change
		changeMap[change.Path] = change
	}

	toTree.Walk(func(p string,te *git2go.TreeEntry) int {
		// Skip directories
		if te.Type == git2go.ObjectTree {
			return 0
		}
		path := te.Name
		if ``!=p {
			path = p + path
		}
		_, ok := changeMap[path]
		if !ok {
			changes = append(changes, &commitDiff{
				Path:path,
				OID: te.Id.String(),
				Index: -1,
				State: COMMIT_DIFF_UNCHANGED,				
				})
		}
		return 0
		})

	for _, c := range changes {
		c.URL = c.getURL(fromOID, toOID);
	}

	return changes, nil
}

// CommitDiff returns the diff between
// two commits. The receiver must call diff.Free()
func (g *Git) NewCommitDiff(fromOID, toOID string) (*git2go.Diff, error) {
	fromTreeID, err := git2go.NewOid(fromOID)
	if nil!=err {
		return nil, util.Error(err)
	}
	toTreeID, err := git2go.NewOid(toOID)
	if nil!=err {
		return nil, util.Error(err)
	}
	fromTree, err := g.Repository.LookupTree(fromTreeID)
	if nil!=err {
		return nil, util.Error(err)
	}
	defer fromTree.Free()

	toTree, err := g.Repository.LookupTree(toTreeID)
	if nil!=err {
		return nil, util.Error(err)
	}
	defer toTree.Free()

	diffOptions, err := git2go.DefaultDiffOptions()
	if nil!=err {
		return nil, util.Error(err)
	}
	diff, err := g.Repository.DiffTreeToTree(fromTree, toTree, 
		&diffOptions)
	if nil!=err {
		return nil, util.Error(err)
	}
	return diff, nil
}

// CommitDiffsPatch returns the indexed patch for 
// the differences between the two commits
// stored as fromOID and toOID
func (g *Git) CommitDiffsPatch(fromOID, toOID string, index int) (*git2go.Patch, error) {
	diff, err := g.NewCommitDiff(fromOID, toOID)
	if nil!=err {
		return nil, err
	}
	defer diff.Free()

	return diff.Patch(index)
}

func (g *Git) CommitDiffsPretty(fromOID, toOID string, index int) (string ,error) {
	diff, err := g.NewCommitDiff(fromOID, toOID)
	if nil!=err {
		return err.Error(), errors.Trace(err)
	}
	defer diff.Free()

	delta, err := diff.GetDelta(index)
	if nil!=err {
		return err.Error(), errors.Trace(err)
	}

	ob, err := g.Repository.LookupBlob(delta.OldFile.Oid)
	if nil!=err {
		return err.Error(), errors.Trace(err)
	}
	defer ob.Free()
	nb, err := g.Repository.LookupBlob(delta.NewFile.Oid)
	if nil!=err {
		return err.Error(), errors.Trace(err)
	}
	defer nb.Free()

	glog.Infof(`OB = %s`, string(ob.Contents()))
	glog.Infof(`NB = %s`, string(nb.Contents()))

	dmp := diffmatchpatch.New()
	return PrettyDiff(
		dmp.DiffMain(
			string(ob.Contents()),
			string(nb.Contents()),
			false,
		)), nil
}

// func (g *Git) CommitDiffsFile(fromOID, toOID string, index int, fromFile bool) () {
// 	fromTreeID, err := git2go.NewOid(fromOID)
// 	if nil!=err {
// 		return nil, util.Error(err)
// 	}
// 	toTreeID, err := git2go.NewOid(toOID)
// 	if nil!=err {
// 		return nil, util.Error(err)
// 	}
// 	fromTree, err := g.Repository.LookupTree(fromTreeID)
// 	if nil!=err {
// 		return nil, util.Error(err)
// 	}
// 	defer fromTree.Free()

// 	toTree, err := g.Repository.LookupTree(toTreeID)
// 	if nil!=err {
// 		return nil, util.Error(err)
// 	}
// 	defer toTree.Free()

// 	diffOptions, err := git2go.DefaultDiffOptions()
// 	if nil!=err {
// 		return nil, util.Error(err)
// 	}
// 	diff, err := g.Repository.DiffTreeToTree(fromTree, toTree, 
// 		&diffOptions)
// 	if nil!=err {
// 		return nil, util.Error(err)
// 	}
// 	defer diff.Free()

// 	delta, err := diff.GetDelta(index)
// 	if nil!=err {
// 		return nil, util.Error(err)
// 	}
// 	workFile, workTree := delta.NewFile, toTree
// 	if fromFile {
// 		workFile, workTree = delta.OldFile, fromTree
// 	}
// 	if nil==workFile.Oid || workFile.Oid.IsZero() {
// 		return 
// 	}

// }

func PrettyDiff(diffs []diffmatchpatch.Diff) string {
	var buff bytes.Buffer
	for _, diff := range diffs {
		text := strings.Replace(html.EscapeString(diff.Text), "\n", "&para;<br>", -1)
		switch diff.Type {
		case diffmatchpatch.DiffInsert:
			_, _ = buff.WriteString("<ins class=\"inserted\">")
			_, _ = buff.WriteString(text)
			_, _ = buff.WriteString("</ins>")
		case diffmatchpatch.DiffDelete:
			_, _ = buff.WriteString("<del class=\"deleted\">")
			_, _ = buff.WriteString(text)
			_, _ = buff.WriteString("</del>")
		case diffmatchpatch.DiffEqual:
			_, _ = buff.WriteString("<span>")
			_, _ = buff.WriteString(text)
			_, _ = buff.WriteString("</span>")
		}
	}
	return buff.String()
}