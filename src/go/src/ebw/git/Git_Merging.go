package git

import (
	"fmt"
	"io/ioutil"
	"os"
	// "os"
	"strings"

	git2go "gopkg.in/libgit2/git2go.v25"

	"ebw/util"
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
func (g *Git) catFileGit(path string) (bool, []byte, error) {
	raw, err := g.CatFileVersion(path, GFV_THEIR_HEAD, nil)
	their, err := g.mergeFileInput(path, raw, err)
	if nil != err {
		return false, nil, err
	}
	raw, err = g.CatFileVersion(path, GFV_OUR_HEAD, nil)
	our, err := g.mergeFileInput(path, raw, err)
	if nil != err {
		return false, nil, err
	}
	raw, err = g.CatFileVersion(path, GFV_ANCESTOR, nil)
	ancestor, err := g.mergeFileInput(path, raw, err)
	if nil != err {
		return false, nil, err
	}

	res, err := git2go.MergeFile(ancestor,
		our,
		their,
		&git2go.MergeFileOptions{
			Favor: git2go.MergeFileFavorNormal,
			Flags: git2go.MergeFileDefault,
		})
	if nil != err {
		return false, []byte{}, g.Error(err)
	}
	defer res.Free()
	return res.Automergeable, res.Contents, nil
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
func (g *Git) CatFileVersion(path string, v GitFileVersion, auto *bool) ([]byte, error) {
	if nil != auto {
		*auto = true
	}
	switch v {
	case GFV_ANCESTOR:
		return g.readPathFromIndexStage(path, 1)
	case GFV_OUR_HEAD:
		head, err := g.Repository.Head()
		if nil != err {
			return nil, g.Error(err)
		}
		defer head.Free()
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
		automergeable, raw, err := g.catFileGit(path)
		if nil != err {
			return nil, err
		}
		if nil != auto {
			*auto = automergeable
		}
		return raw, err
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

// mergeAutomatic performs and automatic merge with the given remote/branch remote,
// and attempts to complete a commit if there are no conflicts. The return values
// and a boolean indicating true if the automatic merge succeeded, false otherwise.
func (g *Git) mergeAutomatic(remoteName string, mergeDescription string) (bool, error) {
	var err error
	if err = g.MergeBranch(remoteName, ResolveAutomatically); nil != err {
		return false, err
	}
	conflicted, err := g.HasConflicts()
	if nil != err {
		return false, err
	}
	if conflicted {
		// If the repo is conflicted, we were not able to automatically merge,
		// so we set the EBWRepoStatus to indicate that a merge is in process,
		// and we return
		if err = g.transformEBWRepoStatus(func(rs *EBWRepoStatus) error {
			rs.MergingDescription = mergeDescription
			return nil
		}); nil != err {
			return false, err
		}
		return false, nil
	}
	if _, err = g.Commit(`Merged automatically ` + mergeDescription); nil != err {
		// Need to set our LastPushSHA so that we don't
		return false, err
	}
	return true, nil
}

// MergeBranch merges the named branch with the given resolution.
func (g *Git) MergeBranch(remoteName string, resolve MergeResolution) error {
	if err := g.FetchRemote(remoteName); nil != err {
		return err
	}
	remoteCommit, err := g.GetBranch(remoteName)
	if nil != err {
		return err
	}
	defer remoteCommit.Free()
	return g.mergeWithResolution(remoteCommit, resolve)
}

// mergeCleanup cleans up the state of the repo, and also removes any temporary
// files that a merge or conflict state might have created.
// Although we should only really need to call this after closing a conflict,
// we will use it after every Commit, since it won't cause any issues.
func (g *Git) mergeCleanup() error {
	if err := g.Repository.StateCleanup(); nil != err {
		return g.Error(err)
	}
	rs, err := g.readEBWRepoStatus()
	if nil != err {
		return err
	}
	rs.ResetMerge()
	if err = rs.Write(); nil != err {
		return g.Error(err)
	}
	// Remove the merge-their directory - once our merge is completed, we don't need
	// this anymore
	os.RemoveAll(g.PathTheir())
	return nil
}

// mergeCommits returns a slice of the Commits that contributed to the current
// merge. includeHead indicates whether to include the HEAD commit - this
// should always be TRUE.
// The caller needs to free the Commit structures. Use the handy FreeCommitSlice([]*Commit)
// to do so.
func (g *Git) mergeCommits(includeHead bool) ([]*git2go.Commit, error) {
	commits := []*git2go.Commit{}

	//Getting repo HEAD
	if includeHead {
		head, err := g.Repository.Head()
		if err != nil {
			return nil, g.Error(err)
		}
		defer head.Free()

		headCommit, err := g.Repository.LookupCommit(head.Target())
		if err != nil {
			return nil, g.Error(err)
		}
		commits = append(commits, headCommit)
	}

	mergeHeads, err := g.Repository.MergeHeads()
	if nil != err {
		return nil, g.Error(err)
	}
	for _, h := range mergeHeads {
		obj, err := g.Repository.Lookup(h)
		if nil != err {
			return nil, g.Error(err)
		}
		c, err := obj.AsCommit()
		if nil != err {
			return nil, g.Error(err)
		}
		commits = append(commits, c)
	}
	return commits, nil
}

// mergeFileInput is a small utility method to return a git2go.MergeFileInput
// intelligently for merging of sourced files.
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

// MergeFileResolutionState returns the state of the merging file at the
// // given path.
func (g *Git) mergeFileResolutionState(path string) (MergeFileResolutionState, error) {
	// any merge file that we consider MUST be in a conflict state
	conflicted, err := g.IsFileConflicted(path)
	if nil != err {
		return MergeFileError, err
	}
	if !conflicted {
		return MergeFileResolved, nil
	}
	// TODO: Consider whether we should consider each file on its merits when
	// working out whether a merge file is conflicted
	return MergeFileConflict, nil
	// info, err := r.MergeFileInfo(path)
	// if nil != err {
	// 	return MergeFileError, err
	// }
	// if info.Index.Hash.Equal(info.Working.Hash) {
	// 	if info.Index.Hash.Equal(info.Their.Hash) {
	// 		// our-their & repo are the same => RESOLVED
	// 		return MergeFileResolved, nil
	// 	}
	// 	// theirs differs from ours - but for now I'm going to
	// 	// differentiate this state
	// 	return MergeFileModified, nil
	// }
	// // since working differs from index =>
	// // implies modified, and hashes aren't the same,
	// // so we are new or deleted or modified
	// if info.Working.Hash.IsZero() {
	// 	return MergeFileNew, nil
	// }
	// if info.Their.Hash.IsZero() {
	// 	return MergeFileDeleted, nil
	// }
	// return MergeFileModified, nil
}

// MergingFilesList returns a list of the files that are currently in the
// process of being merged to resolve the current conflict state
func (g *Git) MergingFilesList() ([]*IndexFileStatusAbbreviated, error) {
	repoStatus, err := g.readEBWRepoStatus()
	if nil != err {
		return nil, err
	}
	files := make([]*IndexFileStatusAbbreviated, len(repoStatus.MergingFiles))
	for i, path := range repoStatus.MergingFiles {
		rs, err := g.mergeFileResolutionState(path)
		if nil != err {
			return nil, err
		}
		files[i] = &IndexFileStatusAbbreviated{
			Path:   path,
			Status: rs.String(),
		}
	}
	return files, nil
}

// PullOrigin pulls the repo origin and attempts an auto-merge with master branch.
// If the merge succeeds, a new commit is generated.
func (g *Git) PullOrigin() error {
	_, err := g.mergeAutomatic(`origin/master`, `with github.`)
	return err
}

// PullUpstream pulls the repo upstream and attempts to auto-merge with the master branch.
// If the merge succeeds without conflict, a new commit is generated.
func (g *Git) PullUpstream() error {
	_, err := g.mergeAutomatic(`upstream/master`, `with the original series`)
	return err
}

// MergePullRequest does a merge with the given PullRequest identified by number and pullRequestSHA
func (g *Git) MergePullRequest(pullRequestNumber int, remoteName, pullRequestSHA string) error {
	var err error
	if err := g.FetchRemote(remoteName); nil != err {
		return err
	}

	prId, err := git2go.NewOid(pullRequestSHA)
	if nil != err {
		return util.Error(err)
	}
	prCommit, err := g.Repository.Lookup(prId)
	if nil != err {
		return g.Error(err)
	}
	defer prCommit.Free()

	if err = g.mergeWithResolution(prCommit, ResolveConflicted); nil != err {
		return err
	}

	conflicted, err := g.HasConflicts()
	if nil != err {
		return err
	}
	if !conflicted {
		return g.Error(fmt.Errorf(`Pull Request %d introduced no changes.`, pullRequestNumber))
	}

	if err = g.transformEBWRepoStatus(func(rs *EBWRepoStatus) error {
		rs.MergingPRNumber = pullRequestNumber
		rs.MergingDescription = fmt.Sprintf(`with PR number %d`, pullRequestNumber)
		return nil
	}); nil != err {
		return g.Error(err)
	}
	return nil
}

// mergeWithResolution merges the newCommitObject into to current HEAD,
// and resolves any conflicts per the resolve flag, either
// attempting resolution, or marking all file differences as CONFLICTED.
// After running Merge, it should be sufficient to check for any conflicts to
// determine how the merge resolved. If resolve was ResolveAutomatically,
// and no conflicts where encountered, it should be possible to commit at once.
func (g *Git) mergeWithResolution(newCommitObject *git2go.Object, resolve MergeResolution) error {
	remoteCommit, err := g.Repository.LookupAnnotatedCommit(newCommitObject.Id())
	if nil != err {
		return g.Error(err)
	}
	defer remoteCommit.Free()

	defaultMergeOptions, err := git2go.DefaultMergeOptions()
	if nil != err {
		return g.Error(err)
	}
	if err := g.Repository.Merge([]*git2go.AnnotatedCommit{remoteCommit},
		&defaultMergeOptions,
		&git2go.CheckoutOpts{},
	); nil != err {
		// We handle Merge Conflict && Conflict ourselves, so we're not actually worried about this error...???
		if git2go.IsErrorCode(err, git2go.ErrMergeConflict) ||
			git2go.IsErrorCode(err, git2go.ErrConflict) {
			g.Log.Infof(`Merge returned MergeConflict %v, ErrConflict %v`, git2go.IsErrorCode(err, git2go.ErrMergeConflict),
				git2go.IsErrorCode(err, git2go.ErrConflict))
			// return nil - we need to skip ahead to the resolving
		} else {
			return g.Error(err)
		}
	}

	switch resolve {
	case ResolveAutomatically:
		// This is, in a sense, default git functionality. To check whether
		// we have successfully resolved, I only have to check whether the index has
		// conflicts.
		conflicted, err := g.HasConflicts()
		if nil != err {
			return g.Error(err)
		}
		if !conflicted {
			// No conflicts => so I'm done here. Our caller will be responsible for
			// completing the commit
		}
		if err := g.writeTheirsForConflictedFiles(newCommitObject); nil != err {
			return err
		}
	case ResolveConflicted:
		// Whatever the outcome from Git, I am going to:
		// 1. Set all our files as conflicted,
		// 2. Write the their-directories for all conflicted files.
		// 3. Write the our-directories for all conflicted files.
		if err := g.ConflictFileDiffs(nil, newCommitObject); nil != err {
			return err
		}
		if err := g.writeTheirsForConflictedFiles(newCommitObject); nil != err {
			return err
		}
		if err := g.writeOursForConflictedFiles(); nil != err {
			return err
		}
	}
	// At this point, any conflicted files are the files that the user will
	// need to resolve. Since we require RESOLUTION on these, but also want to
	// track which they are _even after the user might have resolved them_,
	// we will store them with the EBWRepoStatus
	conflictedFiles, err := g.ListConflictedFiles()
	if nil != err {
		return err
	}
	extendedStatus, err := g.readEBWRepoStatus()
	if nil != err {
		return err
	}
	extendedStatus.MergingFiles = conflictedFiles
	if err = extendedStatus.Write(); nil != err {
		return g.Error(err)
	}
	return nil
}

// PullAbort aborts a merge that is in progress. This isn't quite
// like `git merge --abort`, because this is in fact simply a RESET
// to HEAD, which occurs in spite of, or while ignoring, any changed
// files in WD. `git merge --abort`, though, will fail if there are modified
// files in WD (or something like that).
func (g *Git) PullAbort() error {
	if err := g.mergeCleanup(); nil != err {
		return err
	}
	head, err := g.Repository.Head()
	if nil != err {
		return g.Error(err)
	}
	defer head.Free()
	commit, err := g.Repository.LookupCommit(head.Target())
	if nil != err {
		return g.Error(err)
	}
	defer commit.Free()
	if err := g.Repository.ResetToCommit(commit, git2go.ResetHard, nil); nil != err {
		return g.Error(err)
	}
	if err := g.Repository.StateCleanup(); nil != err {
		return g.Error(err)
	}
	return nil
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

// readPathForTreeObject reads the given path from the provided git tree object.
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
		// We don't report ErrNotFound, since this is a 'valid' error. We just bounce it
		// back
		if git2go.IsErrorCode(err, git2go.ErrNotFound) {
			return nil, err
		}
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

// RemoveConflict resolves the conflict on the file at the given path
// with the file in the WD, or deletes if the file does not exist in the
// WD
func (g *Git) RemoveConflict(path string) error {
	index, err := g.Repository.Index()
	if nil != err {
		return g.Error(err)
	}
	defer index.Free()
	if err = index.RemoveConflict(path); nil != err {
		return g.Error(err)
	}
	fileExists, err := util.FileExists(g.Path(path))
	if nil != err {
		return g.Error(err)
	}
	if fileExists {
		if err = index.AddByPath(path); nil != err {
			return g.Error(err)
		}
	}
	if err = index.Write(); nil != err {
		return g.Error(err)
	}
	return nil
}
