package git

import (
	"fmt"
	"io/ioutil"
	"os"
	// "os"
	"strings"

	git2go "gopkg.in/libgit2/git2go.v25"
)

type GitFileVersion int

const (
	GFV_ANCESTOR   GitFileVersion = 1
	GFV_OUR_HEAD                  = 2
	GFV_THEIR_HEAD                = 3
	GFV_OUR_WD                    = 4
	GFV_THEIR_WD                  = 5
	GFV_GIT_MERGED                = 6
	GFV_INDEX                     = 7
)

// ParseGitFileVersion converts a string to a GitFileVersion
func ParseGitFileVersion(in string) (GitFileVersion, error) {
	in = strings.ToLower(in)
	switch in {
	case `ancestor`:
		return GFV_ANCESTOR, nil
	case `our-head`:
		return GFV_OUR_HEAD, nil
	case `their-head`:
		return GFV_THEIR_HEAD, nil
	case `our-wd`:
		return GFV_OUR_WD, nil
	case `their-wd`:
		return GFV_THEIR_WD, nil
	case `git`:
		return GFV_GIT_MERGED, nil
	case `index`:
		return GFV_INDEX, nil
	}
	return GitFileVersion(0), fmt.Errorf(`Unable to parse GitFileVersion '%s'`, in)
}

// catFileGit returns the git merge of the file between their HEAD and our HEAD
func (g *Git) catFileGit(path string) ([]byte, error) {
	raw, err := g.CatFileVersion(path, GFV_THEIR_HEAD)
	their, err := g.mergeFileInput(path, raw, err)
	if nil != err {
		return nil, err
	}
	raw, err = g.CatFileVersion(path, GFV_OUR_HEAD)
	our, err := g.mergeFileInput(path, raw, err)
	if nil != err {
		return nil, err
	}
	raw, err = g.CatFileVersion(path, GFV_ANCESTOR)
	ancestor, err := g.mergeFileInput(path, raw, err)
	if nil != err {
		return nil, err
	}

	res, err := git2go.MergeFile(ancestor,
		our,
		their,
		&git2go.MergeFileOptions{
			Favor: git2go.MergeFileFavorNormal,
			Flags: git2go.MergeFileDefault,
		})
	if nil != err {
		return []byte{}, g.Error(err)
	}
	defer res.Free()
	fmt.Println(`Automergeable = `, res.Automergeable)
	return res.Contents, nil
}

// ListConflictedFiles returns a list of the files that are conflicted in the repo.
func (g *Git) ListConflictedFiles() ([]string, error) {
	index, err := g.Repository.Index()
	if nil != err {
		return nil, g.Error(err)
	}
	defer index.Free()
	iter, err := index.ConflictIterator()
	if nil != err {
		return nil, g.Error(err)
	}
	defer iter.Free()
	files := []string{}
	for {
		c, err := iter.Next()
		if nil != err {
			if git2go.IsErrorCode(err, git2go.ErrIterOver) {
				break
			}
			return nil, g.Error(err)
		}
		// There can only be a conflict if we have a common Ancestor, surely...?
		// Although what if two branches create a new file with the same name,
		// then there shouldn't be a common Ancestor, but there will still be a conflict.
		if nil != c.Ancestor {
			files = append(files, c.Ancestor.Path)
		} else {
			if nil != c.Our {
				files = append(files, c.Our.Path)
			} else {
				files = append(files, c.Their.Path)
			}
		}
	}
	return files, nil
}

// CatFileVersion returns the contents of the path for the given
// GitFileVersion
func (g *Git) CatFileVersion(path string, v GitFileVersion) ([]byte, error) {
	switch v {
	case GFV_ANCESTOR:
		return g.readPathFromIndexStage(path, 1)
	case GFV_OUR_HEAD:
		head, err := g.Repository.Head()
		if nil != err {
			return nil, g.Error(err)
		}
		return g.readPathForTreeReference(head, path)
	case GFV_THEIR_HEAD:
		// I COULD ALSO USE THE GFV_INDEX APPROACH
		if !g.IsMerging() {
			return nil, g.Error(fmt.Errorf(`Repo is not merging`))
		}
		mergeHead, err := g.getMergeHeadObject()
		if nil != err {
			return nil, err
		}
		defer mergeHead.Free()
		return g.readPathForTreeObject(mergeHead, path)
	case GFV_OUR_WD:
		return g.readDiskFile(g.Path(path))
	case GFV_THEIR_WD:
		if !g.IsMerging() {
			return nil, g.Error(fmt.Errorf(`Repo is not merging`))
		}
		return g.readDiskFile(g.PathTheir(path))
	case GFV_GIT_MERGED:
		return g.catFileGit(path)
	case GFV_INDEX:
		conflicted, err := g.IsFileConflicted(path)
		if nil != err {
			return nil, err
		}
		if conflicted {
			return g.readPathFromIndexStage(path, 2)
		}
		return g.readPathFromIndex(path)
	}
	return nil, fmt.Errorf(`Not implemented`)
}

// getMergeHeadObject gets the git2go Object for the current MERGE HEAD.
// TODO We find the merge HEAD by reading the MERGE_HEAD file from .git.
// It would be preferable if we found the MERGE_HEAD some other way, perhaps,
// and we should also handle the situation where there might be multiple
// merge-heads.
func (g *Git) getMergeHeadObject() (*git2go.Object, error) {
	raw, err := g.readDiskFile(g.Path(`.git`, `MERGE_HEAD`))
	if nil != err {
		return nil, err
	}
	headOid, err := git2go.NewOid(string(raw[0:40]))
	if nil != err {
		return nil, g.Error(err)
	}
	return g.Repository.Lookup(headOid)
}

// mergeFileInput is a small utility method to return a git2go.MergeFileInput intelligently
// for merging of sourced files.
func (g *Git) mergeFileInput(path string, raw []byte, err error) (git2go.MergeFileInput, error) {
	in := git2go.MergeFileInput{Path: path, Mode: 0644}
	if os.IsNotExist(err) {
		in.Path = ``
		in.Mode = 0
		err = nil
	} else {
		in.Contents = raw
	}
	return in, err
}

// readDistFile reads a file from disk. If the file does not
// exist, it returns os.IsNotExist error
func (g *Git) readDiskFile(path string) ([]byte, error) {
	raw, err := ioutil.ReadFile(path)
	if nil != err {
		return nil, g.Error(err)
	}
	return raw, nil
}

// readPathFromHead reads the given path from the provided git tree object.
// The provided object could be a commit or a tree directly, so we peel away until
// we find a tree, then we use that to read the object.
func (g *Git) readPathForTreeObject(object *git2go.Object, path string) ([]byte, error) {
	treeObject, err := object.Peel(git2go.ObjectTree)
	if nil != err {
		err := fmt.Errorf(`Object is of type %s`, treeObject.Type().String())
		return nil, g.Error(err)
	}
	tree, err := treeObject.AsTree()
	if nil != err {
		err := fmt.Errorf(`Object is of type %s`, treeObject.Type().String())
		return nil, g.Error(err)
	}
	defer tree.Free()
	te, err := tree.EntryByPath(path)
	if nil != err {
		return nil, g.Error(err)
	}
	blob, err := g.Repository.LookupBlob(te.Id)
	if nil != err {
		return nil, g.Error(err)
	}
	defer blob.Free()
	return blob.Contents(), nil
}

// readPathForHead reads the given path from the provided git tree reference
func (g *Git) readPathForTreeReference(head *git2go.Reference, path string) ([]byte, error) {
	tree, err := head.Peel(git2go.ObjectTree)
	if nil != err {
		return nil, g.Error(err)
	}
	defer tree.Free()
	return g.readPathForTreeObject(tree, path)
}

// readPathFromIndex reads the path for the given file from the index.
// It assumes that the file is not conflicted, in which case you
// need to use readPathFromIndexStage instead.
func (g *Git) readPathFromIndex(path string) ([]byte, error) {
	idx, err := g.Repository.Index()
	if nil != err {
		return nil, g.Error(err)
	}
	defer idx.Free()
	i, err := idx.Find(path)
	if nil != err {
		return nil, g.Error(err)
	}
	entry, err := idx.EntryByIndex(i)
	if nil != err {
		return nil, g.Error(err)
	}
	blob, err := g.Repository.LookupBlob(entry.Id)
	if nil != err {
		return nil, g.Error(err)
	}
	defer blob.Free()
	return blob.Contents(), nil
}

// readPathFromIndexStage reads a 'staged' version of the file from the index.
// When a file is in conflict, it has 3 staged version, per
// https://git-scm.com/book/en/v2/Git-Tools-Advanced-Merging
// There are:
// 1 - ancestor
// 2 - our version
// 3 - their version
func (g *Git) readPathFromIndexStage(path string, stage int) ([]byte, error) {
	idx, err := g.Repository.Index()
	if nil != err {
		return nil, g.Error(err)
	}
	defer idx.Free()
	// Stage 1 is ANCESTOR : see https://git-scm.com/book/en/v2/Git-Tools-Advanced-Merging
	oid, err := idx.EntryByPath(path, stage)
	if nil != err {
		if git2go.IsErrorCode(err, git2go.ErrNotFound) {
			return nil, os.ErrNotExist
		}
		return nil, g.Error(fmt.Errorf(`readPathFromIndexStage('%s', %d) error: %s`, path, stage, err.Error()))
	}
	blob, err := g.Repository.LookupBlob(oid.Id)
	if nil != err {
		return nil, g.Error(err)
	}
	defer blob.Free()
	return blob.Contents(), nil
}
