package git

import (
	"crypto/sha1"
	"errors"
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"
	"regexp"

	"github.com/golang/glog"
	"github.com/google/go-github/github"
	"github.com/sirupsen/logrus"
	git2go "github.com/craigmj/git2go/v31"

	"ebw/util"
)

type FileVersion int

const (
	FileAncestor FileVersion = 1
	FileOur                  = 2
	FileTheir                = 3
	FileWorking              = 4
	FileMerge                = 5
)

var ErrNoGithubParent = errors.New(`This repo has no github parent: it was not forked.`)
var ErrNotInConflictedState = errors.New(`This repo is not in a conflicted state.`)

// Repo is a struct mapped to a directory on dist with a checked-out
// github repo. The directory does not necessarily have to be configured
// against the server git_cache, but could be retrieved with
// NewRepoForDir(..), which allows creating the repo against an existing
// directory possibly in a different location.
type Repo struct {
	*git2go.Repository
	Dir   string
	isCLI bool

	Client    *Client
	RepoOwner string
	RepoName  string

	EBWRepoStatus *EBWRepoStatus

	state RepoState

	Log *logrus.Entry
	Git *Git
}

// ListWatchers lists all the watchers of the repo on Github
func (r *Repo) ListWatchers() ([]*github.User, error) {
	users := []*github.User{}
	var opts github.ListOptions
	if err := GithubPaginate(&opts, func() (*github.Response, error) {
		u, res, err := r.Client.Client.Activity.ListWatchers(
			r.Client.Context,
			r.RepoOwner,
			r.RepoName,
			&opts)
		if nil!=err {
			return nil, util.Error(err)
		}
		users = append(users, u...)
		return res, err
	}); nil!=err {
		return nil, err
	}
	return users, nil
}

// Close closes the repo and any resources it is using
func (r *Repo) Close() {
	if nil != r.Repository {
		r.Repository.Free()
	}
	if nil != r.Git {
		r.Git.Close()
	}
}

// Checkout checks out the repository into the repo directory.
func (r *Repo) Checkout() error {
	_, err := Checkout(r.Client, r.RepoOwner, r.RepoName, ``)
	if nil != err {
		return err
	}
	return nil
}

// NewRepo returns a new Repo struct configured against the directory
// with the checked-out repo.
func NewRepo(client *Client, repoOwner, repoName string) (*Repo, error) {
	repoDir, err := RepoDir(client.Username, repoOwner, repoName)
	if nil != err {
		return nil, err
	}
	_, err = os.Stat(repoDir)
	if nil != err {
		if os.IsNotExist(err) {
			if _, err := Checkout(client, repoOwner, repoName, ``); nil != err {
				return nil, err
			}
		} else {
			return nil, err
		}
	}
	repo, err := git2go.OpenRepository(repoDir)
	if nil != err {
		return nil, err
	}
	r := &Repo{
		Repository: repo,
		Dir:        repoDir,
		Client:     client,
		RepoOwner:  repoOwner,
		RepoName:   repoName,
		state:      StateNotSet,
	}
	r.Git, err = OpenGit(repoDir, nil)
	if nil != err {
		return nil, err
	}
	if r.EBWRepoStatus, err = r.readEBWRepoStatus(); nil != err {
		return nil, err
	}
	return r, nil
}

// CLI returns true if this repo is working against a CLI, false
// if we're in a server situation.
func (r *Repo) CLI() bool {
	return r.isCLI
}

// Path returns the path to the filename INSIDE THE GIT REPO
// constructed from the
// concatenated elements passed to RepoPath.
// If you don't provide any elements,
// the repo dir is returned.
func (r *Repo) RepoPath(path ...string) string {
	if nil == r.Git {
		panic(`r.Git is nil`)
	}
	return r.Git.Path(path...)
}

// TheirPath returns the path to the `their` version of a file
// used during Merge resolution.
func (r *Repo) TheirPath(path ...string) string {
	return r.Git.PathTheir(path...)
}

// ConfigPath returns the path mapped into the
// EBW `config` directory
func (r *Repo) ConfigPath(path ...string) string {
	return r.Git.PathEBWConfig(path...)
}

// NewRepoForDir returns a new repo configured for the given
// directory.
func NewRepoForDir(client *Client, repoDir string, isCLI bool) (*Repo, error) {
	repo, err := git2go.OpenRepository(repoDir)
	if nil != err {
		return nil, err
	}

	r := &Repo{
		Repository: repo,
		isCLI:      isCLI,
		Dir:        repoDir,
		Client:     client,
		state:      StateNotSet,
	}
	// RepoOwnerAndName will cache the owner and name results
	_, _, err = r.RepoOwnerAndName()
	if nil != err {
		fmt.Fprintf(os.Stderr, "%s\n", err.Error())
	}
	r.Git, err = OpenGit(repoDir, nil)
	if nil != err {
		return nil, err
	}
	return r, nil
}

// RepoOwnerAndName returns the repo owner and name for the
// repo.
func (r *Repo) RepoOwnerAndName() (string, string, error) {
	if `` != r.RepoOwner {
		return r.RepoOwner, r.RepoName, nil
	}
	origin, err := r.Remotes.Lookup(`origin`)
	if nil != err {
		return ``, ``, fmt.Errorf(`Failed to find origin remote for this repo: %s`, err.Error())
	}
	defer origin.Free()
	githubRegexp := regexp.MustCompile(`github\.com/([^/]+)/([^/.]+)[/\.]`)
	m := githubRegexp.FindStringSubmatch(origin.Url())
	if nil == m {
		if r.CLI() {
			// The CLI doesn't necessarily require repoOwner and name
			return ``, ``, nil
		}
		return ``, ``, fmt.Errorf(`Unabled to parse owner and name from repo origin URL %s. Is it a github URL?`, origin.Url())
	}
	r.RepoOwner, r.RepoName = m[1], m[2]
	return r.RepoOwner, r.RepoName, nil
}

// StatusList returns the list of status entries for the
// repo. The caller needs to .Free() the returned object.
func (r *Repo) StatusList() (*git2go.StatusList, error) {
	sl, err := r.Repository.StatusList(&git2go.StatusOptions{
		Show:  git2go.StatusShowIndexAndWorkdir,
		Flags: 0,
		// PathSpec: nil,
	})
	if nil != err {
		return nil, r.Error(err)
	}
	return sl, nil
}

// StatusListFilenames returns a slice on only the
// filenames of the files appearing in the StatusList
func (r *Repo) StatusListFilenames() ([]string, error) {
	sl, err := r.StatusList()
	if nil != err {
		return nil, err
	}
	defer sl.Free()
	slN, err := sl.EntryCount()
	if nil != err {
		return nil, util.Error(err)
	}
	files := make([]string, slN)
	for i := 0; i < slN; i++ {
		se, err := sl.ByIndex(i)
		if nil != err {
			return nil, util.Error(err)
		}
		fn := se.HeadToIndex.OldFile.Path
		if `` == fn {
			fn = se.HeadToIndex.NewFile.Path
			if `` == fn {
				fn = se.IndexToWorkdir.OldFile.Path
				if `` == fn {
					fn = se.IndexToWorkdir.NewFile.Path
				}
			}
		}
		files[i] = fn
	}
	return files, nil
}

// StatusCount returns the number of uncommitted items in the
// index-head and the workingdir-index for the repo.
func (r *Repo) StatusCount() (int, int, error) {
	sl, err := r.Repository.StatusList(&git2go.StatusOptions{
		Show: git2go.StatusShowIndexOnly,
	})
	if nil != err {
		return 0, 0, util.Error(err)
	}
	defer sl.Free()
	indexCount, err := sl.EntryCount()
	if nil != err {
		return 0, 0, util.Error(err)
	}
	sl, err = r.Repository.StatusList(&git2go.StatusOptions{
		Show: git2go.StatusShowWorkdirOnly,
	})
	if nil != err {
		return 0, 0, util.Error(err)
	}
	defer sl.Free()
	workdirCount, err := sl.EntryCount()
	if nil != err {
		return 0, 0, util.Error(err)
	}
	return indexCount, workdirCount, nil
}

// StagedFilesAbbreviated returns an easily JSON encoded list of staged
// files with paths.
func (r *Repo) StagedFilesAbbreviated() ([]*IndexFileStatusAbbreviated, error) {
	ifl, err := r.StagedFiles()
	if nil != err {
		return nil, err
	}
	abbrev := make([]*IndexFileStatusAbbreviated, len(ifl))
	for i, ifile := range ifl {
		abbrev[i] = ifile.Abbreviated()
	}
	return abbrev, nil
}

// StagedFiles returns the list of files staged but not committed
// in the repository.
func (r *Repo) StagedFiles() ([]*IndexFileStatus, error) {
	return r.Git.StagedFiles()
}

// PrintStatusList prints the information from the status list for
// the repo. It is primarily at this point intended as a debugging tool.
func (r *Repo) PrintStatusList() error {
	sl, err := r.StatusList()
	if nil != err {
		return err
	}
	defer sl.Free()
	entryCount, err := sl.EntryCount()
	if nil != err {
		return err
	}
	for i := 0; i < entryCount; i++ {
		se, err := sl.ByIndex(i)
		if nil != err {
			return err
		}
		oidString := func(oid *git2go.Oid) string {
			if nil == oid {
				return `---`
			}
			return oid.String()
		}
		fmt.Printf(`- Status: %s
  HeadToIndex: 
    oldFile: %s (%10s)
    newFile: %s (%10s)
  IndexToWorkdir:
    oldFile: %s (%10s)
    newFile: %s (%10s)
`, GitStatusToString(se.Status),
			se.HeadToIndex.OldFile.Path,
			oidString(se.HeadToIndex.OldFile.Oid),
			se.HeadToIndex.NewFile.Path,
			oidString(se.HeadToIndex.NewFile.Oid),
			se.IndexToWorkdir.OldFile.Path,
			oidString(se.IndexToWorkdir.OldFile.Oid),
			se.IndexToWorkdir.NewFile.Path,
			oidString(se.IndexToWorkdir.NewFile.Oid),
		)
	}
	return nil
}

// GithubRepo returns the github Repository for this repo.
func (r *Repo) GithubRepo() (*github.Repository, error) {
	return r.Git.GithubRepo()
}

// AddRemote adds the given remoteName with the given CloneURL,
// but does not change any existing remote with the given remoteName
func (r *Repo) AddRemote(remoteName string, remoteCloneURL string) error {
	return r.Git.AddRemote(remoteName, remoteCloneURL)
}

// SetUpstreamRemote configures the `upstream` remote in the
// github repo. It discovers the upstream remote by looking for
// the repo's parent on Github.
func (r *Repo) SetUpstreamRemote() error {
	return r.Git.SetUpstreamRemote()
}

// HasUpstreamRemote returns true if the repo has an upstream
// remote - ie a parent to the github repo
func (r *Repo) HasUpstreamRemote() (bool, error) {
	return r.Git.HasUpstreamRemote()
}

func (r *Repo) RepoStateStringNoError() string {
	s, err := r.RepoStateString()
	if nil != err {
		return err.Error()
	}
	return s
}

func (r *Repo) RepoStateString() (string, error) {
	s, err := r.GetRepoState()
	if nil != err {
		return ``, err
	}
	return s.String(), nil
}

func (r *Repo) MustRepoState() RepoState {
	s, err := r.GetRepoState()
	if nil != err {
		panic(err)
	}
	return s
}

// CanCreatePR returns true if the Upstream repo is
// behind the Github repo, and there has been a new commit
// since the last PR was issued.
func (r *Repo) CanCreatePR() (bool, error) {
	s, err := r.GetRepoState()
	if nil != err {
		return false, nil
	}
	// Cannot issue a PR unless Github is up-to-date, and
	// the local repo is in sync with Github
	if s.LocalBehind() || s.LocalAhead() {
		return false, nil
	}
	// Cannot issue a PR unless the parent is behind
	if !s.ParentBehind() {
		return false, nil
	}
	head, err := r.Repository.Head()
	if nil != err {
		return false, r.Error(err)
	}
	return r.EBWRepoStatus.LastPRHash != head.Target().String(), nil
}

// ResetState resets a repo's state so that the next call to GetRepoState
// will recompute the repo's state.
func (r *Repo) ResetState() {
	r.state = StateNotSet
}

// GetRepoState returns the RepoState for the repo, cached
// if the repo state has been computed before.
func (r *Repo) GetRepoState() (RepoState, error) {
	if r.state != 0 && r.state != StateNotSet {
		return r.state, nil
	}
	var state RepoState

	// glog.Infof("Getting Repository.State()")

	// Get the state of the local repository.
	switch r.Repository.State() {
	case git2go.RepositoryStateNone:
	case git2go.RepositoryStateMerge:
		state |= EBMConflicted
	default:
		state |= EBMUnimplemented
	}

	hasConflictedFiles, err := r.HasConflictedFiles()
	if nil != err {
		return 0, err
	}
	if hasConflictedFiles {
		state |= EBMConflicted
	}

	// glog.Infof("state = %d, fetching StatusCount", state)

	// Work out changes on the local repository, and how those
	// effect our RepoState
	stagedChanges, workingdirChanges, err := r.StatusCount()
	if nil != err {
		return 0, err
	}

	// In theory on EBM, we're not interested in workingDirChanages, since
	// any changes made on the EBM are immediately staged.
	if 0 < stagedChanges {
		state |= EBMChangesStaged
	}
	if 0 < workingdirChanges {
		state |= EBMChangesUnstaged
	}

	// glog.Infof("staged, workingDir = %d, %d, state = %d, going to FetchRemote", stagedChanges,
	// 	workingdirChanges, state)

	// Check ahead/behind for our github repo and for our
	// parent repo. These are EBMAhead and EBMBehind.
	glog.Infof(`Going to FetchRemote('origin')`)
	if err := r.FetchRemote(`origin`); nil != err {
		return 0, err
	}
	glog.Infof(`FetchRemote('origin') completed`)

	// glog.Infof("fetched remote, going to lookupbranch")

	originBranch, err := r.Repository.LookupBranch(`origin/master`, git2go.BranchRemote)
	if nil != err {
		return 0, r.Error(fmt.Errorf(`Failed to lookup branch origin/master: %s`, err.Error()))
	}
	defer originBranch.Free()

	// glog.Infof("getting r.Repository.Head()")

	localHead, err := r.Repository.Head()
	if nil != err {
		return 0, r.Error(fmt.Errorf(`Failed fetching head for local branch: %s`, err.Error()))
	}
	defer localHead.Free()

	// glog.Infof("Fetching localAhead, localBehind")

	localAhead, localBehind, err := r.Repository.AheadBehind(localHead.Target(), originBranch.Target())
	if nil != err {
		return 0, r.Error(fmt.Errorf(`Failed to get AheadBehind for local and origin branches: %s`, err.Error()))
	}
	if 0 < localAhead {
		state |= EBMAhead
	}
	if 0 < localBehind {
		state |= EBMBehind
	}

	// glog.Infof("Checking for upstreamRemote")

	// A BRANCH points to a Commit, so we need to resolve
	// Check ahead/behind between our github repo and its parent
	hasUpstreamRemote, err := r.HasUpstreamRemote()
	if nil != err {
		return 0, err
	}
	if !hasUpstreamRemote {
		state |= ParentNotExist
	} else {
		// glog.Infof("We've got upstream remote, fetching upstream remote")
		if err := r.FetchRemote(`upstream`); nil != err {
			return 0, err
		}
		// glog.Infof("Looking up upstream/master")
		upstreamBranch, err := r.Repository.LookupBranch(`upstream/master`, git2go.BranchRemote)
		if nil != err {
			return 0, r.Error(fmt.Errorf(`Failed to lookup branch upstream/master: %s`, err.Error()))
		}
		defer upstreamBranch.Free()

		// glog.Infof("Checking upstream ahead/behind")
		originAhead, originBehind, err := r.Repository.AheadBehind(originBranch.Target(), upstreamBranch.Target())
		if nil != err {
			return 0, r.Error(fmt.Errorf(`Failed to get AheadBehind for origin and upstream branches: %s`, err.Error()))
		}
		if 0 < originAhead {
			state |= ParentBehind
		}
		if 0 < originBehind {
			state |= ParentAhead
		}
		if 0 == state&(ParentAhead|ParentBehind) {
			state |= ParentInSync
		} else {
			// glog.Infof("OriginAhead = %d, OriginBehind = %d\n", originAhead, originBehind)
		}
	}
	if 0 == state&(EBMAhead|EBMBehind|EBMConflicted|EBMUnimplemented|EBMChangesStaged|EBMChangesUnstaged) {
		state |= EBMInSync
	}
	r.state = state
	// glog.Infof("Leaving GetRepoState successfully, state = %d", state)
	return state, nil
}

// FetchRemote fetches the named remote for the repo.
func (r *Repo) FetchRemote(remoteName string) error {
	return r.Git.FetchRemote(remoteName)
}

// Stash stashes all current working directory files with the given message.
func (r *Repo) Stash(msg string) (*git2go.Oid, error) {
	sig, err := r.DefaultSignature()
	if nil != err {
		return nil, util.Error(err)
	}
	oid, err := r.Stashes.Save(sig, msg, git2go.StashIncludeUntracked)
	if nil != err {
		return nil, r.Error(err)
	}
	return oid, nil
}

// Unstash unstashes previously stashed working directory files.
func (r *Repo) Unstash() error {
	return r.Stashes.Apply(0, git2go.StashApplyOptions{
		Flags: git2go.StashApplyReinstateIndex,
		// CheckoutOptions: git2go.CheckoutOpts {
		// }
	})
}

// Pull fetches and merges this repo with the branchName of the remote
// repo. Note that Pull will leave the repo in the Merge state. You need
// to fix any conflicts, and then commit.
func (r *Repo) Pull(remoteName, branchName string) error {
	if `` == branchName {
		branchName = `master`
	}
	remote, err := FetchRemote(r.Repository, remoteName)
	if nil != err {
		return r.Error(err)
	}
	defer remote.Free()

	branchReference, err := r.References.Lookup(`refs/remotes/` + remoteName + `/` + branchName)
	if nil != err {
		return r.Error(err)
	}
	defer branchReference.Free()
	remoteCommit, err := r.LookupAnnotatedCommit(branchReference.Target())
	if nil != err {
		return r.Error(err)
	}
	defer remoteCommit.Free()

	return r.mergeAnnotatedCommit(remoteCommit)
}

// mergeAnnotatedCommit does an actual merge of the given AnnotatedCommit
// with the HEAD of the repo.
// If we receive a ErrConflict error from libgit2's Merge command, we ignore it-
// since we will resolve Conflicts ourselves.
func (r *Repo) mergeAnnotatedCommit(remoteCommit *git2go.AnnotatedCommit) error {
	analysis, _, err := r.MergeAnalysis([]*git2go.AnnotatedCommit{remoteCommit})
	if nil != err {
		return r.Error(err)
	}
	if git2go.MergeAnalysisNone == analysis {
		glog.Infof(`MergeAnalysisNone - no merge possible (unused)`)
	}
	if 0 < analysis&git2go.MergeAnalysisNormal {
		glog.Infof(`MergeAnalysisNormal - normal merge required`)
	}
	if 0 < analysis&git2go.MergeAnalysisUpToDate {
		glog.Infof(`MergeAnalysisUpToDate - your HEAD is up to date`)
	}
	if 0 < analysis&git2go.MergeAnalysisFastForward {
		glog.Infof(`MergeAnalysisFastForward - your HEAD hasn't diverged`)
	}
	if 0 < analysis&git2go.MergeAnalysisUnborn {
		glog.Infof(`MergeAnalysisUnborn - HEAD is unborn and merge not possible`)
	}

	defaultMergeOptions, err := git2go.DefaultMergeOptions()
	if nil != err {
		return r.Error(err)
	}
	if err := r.Repository.Merge([]*git2go.AnnotatedCommit{remoteCommit},
		&defaultMergeOptions,
		&git2go.CheckoutOpts{},
	); nil != err {
		// We handle Merge Conflict && Conflict ourselves, so we're not actually worried about this error...???
		if git2go.IsErrorCode(err, git2go.ErrMergeConflict) || git2go.IsErrorCode(err, git2go.ErrConflict) {
			glog.Infof(`Merge returned MergeConflict %v, ErrConflict %v`, git2go.IsErrorCode(err, git2go.ErrMergeConflict),
				git2go.IsErrorCode(err, git2go.ErrConflict))
			return nil
		}
		return r.Error(err)
	}
	return nil
}

// PullAbort aborts a merge that is in progress. This isn't quite
// like `git merge --abort`, because this is in fact simply a RESET
// to HEAD, which occurs in spite of, or while ignoring, any changed
// files in WD. `git merge --abort`, though, will fail if there are modified
// files in WD (or something like that).
func (r *Repo) PullAbort(closePullRequest bool) error {
	return r.Git.PullAbort(closePullRequest)
}

// treeForCommit converts a *Oid into a *Tree. It's just here as a utility
// function.
func (r *Repo) treeForCommit(commitId *git2go.Oid) (*git2go.Tree, error) {
	co, err := r.Repository.Lookup(commitId)
	if nil != err {
		return nil, r.Error(err)
	}
	c, err := co.AsCommit()
	if nil != err {
		return nil, r.Error(err)
	}
	return c.Tree()
}

// FreeCommitSlice frees each of the git2go.Commit pointers
// in the given slice.
func FreeCommitSlice(commits []*git2go.Commit) {
	for _, c := range commits {
		c.Free()
	}
}

// MergeCommits returns a slice of the Commits that contributed to this
// merge. includeHead indicates whether to include the HEAD commit - this
// should always be TRUE.
// The caller needs to free the Commit structures. Use the handy FreeCommitSlice([]*Commit)
// to do so.
func (r *Repo) MergeCommits(includeHead bool) ([]*git2go.Commit, error) {
	return r.Git.mergeCommits(includeHead)
}

// FileBlob returns the file contents as a Blob
func (r *Repo) FileBlob(fileId *git2go.Oid) ([]byte, error) {
	file, err := r.Repository.Lookup(fileId)
	if nil != err {
		return []byte{}, r.Error(err)
	}
	defer file.Free()
	blob, err := file.AsBlob()
	if nil != err {
		return []byte{}, r.Error(err)
	}
	defer blob.Free()
	return blob.Contents(), nil
}

// FileCat returns the contents of a conflicted or merged file.
// The first bool parameter indicates whether the files exists.
func (r *Repo) FileCat(path string, version FileVersion) (bool, []byte, error) {
	var auto bool
	var v GitFileVersion
	switch version {
	case FileOur:
		v = GFV_OUR_HEAD
	case FileTheir:
		v = GFV_THEIR_WD
	case FileAncestor:
		v = GFV_ANCESTOR
	case FileWorking:
		v = GFV_OUR_WD
	case FileMerge:
		v = GFV_GIT_MERGED
	}
	raw, err := r.Git.CatFileVersion(path, v, &auto)
	if nil != err {
		if os.IsNotExist(err) {
			return false, nil, nil
		}
		return false, nil, err
	}
	return true, raw, err
}

// fileTheir returns the 'their' version of the file at the given path. This is the
// same as the version of the file in the HEAD of the branch we're merging with.
// If the file does not exist, (nil,nil) is returned.
func (r *Repo) fileTheir(path string) (*git2go.Oid, error) {
	// panic("r.MergeHeads() not implemented")
	mergeHeads, err := r.MergeHeads()
	if nil != err {
		return nil, r.Error(err)
	}
	if 1 != len(mergeHeads) {
		return nil, r.Error(fmt.Errorf(`Expected 1 MERGE_HEAD, but got %d`, len(mergeHeads)))
	}
	tree, err := r.treeForCommit(mergeHeads[0])
	if nil != err {
		return nil, r.Error(err)
	}
	if nil == tree {
		return nil, r.Error(fmt.Errorf(`Failed to find treeForCommit(mergeHeads[0]))`))
	}
	te, err := tree.EntryByPath(path)
	if nil != err {
		if git2go.IsErrorCode(err, git2go.ErrNotFound) {
			return nil, nil
		}
		return nil, r.Error(err)
	}
	return te.Id, nil
}

// fileOur returns the 'our' version of the file at the given path. This is the
// same as the version of the file in the current HEAD of this branch. If the file
// does not exist in 'our' branch, (nil,nil) is returned.
func (r *Repo) fileOur(path string) (*git2go.Oid, error) {
	headRef, err := r.Head()
	if nil != err {
		return nil, r.Error(err)
	}
	tree, err := r.treeForCommit(headRef.Target())
	if nil != err {
		return nil, r.Error(err)
	}
	te, err := tree.EntryByPath(path)
	if nil != err {
		if git2go.IsErrorCode(err, git2go.ErrNotFound) {
			return nil, nil
		}
		return nil, r.Error(err)
	}
	return te.Id, nil
}

// FileGit returns the GIT version of a conflicted file. The first bool return
// indicates whether the file can be automerged.
func (r *Repo) FileGit(path string) (automergeable bool, raw []byte, err error) {
	raw, err = r.Git.CatFileVersion(path, GFV_GIT_MERGED, &automergeable)
	return
}

// ResetConflictedFilesInWorkingDir goes through conflicted files in the
// working directory and sets them to either our version or
// their version. The file remains in conflict.
func (r *Repo) ResetConflictedFilesInWorkingDir(chooseOurs, conflictedOnly bool,
	filter func(r *Repo, path string, entry *git2go.StatusEntry) bool) error {
	state, err := r.GetRepoState()
	if nil != err {
		return err
	}
	if 0 == EBMConflicted&state {
		return ErrNotInConflictedState
	}

	var filePreference FileVersion = FileOur
	if !chooseOurs {
		filePreference = FileTheir
	}

	statusList, err := r.StatusList()
	if nil != err {
		return err
	}
	defer statusList.Free()

	N, err := statusList.EntryCount()
	if nil != err {
		return r.Error(err)
	}
	for i := 0; i < N; i++ {
		entry, err := statusList.ByIndex(i)
		if nil != err {
			return r.Error(err)
		}
		// If we're only resetting conflicted files, we just move
		// along if the current file isn't conflicted
		if conflictedOnly &&
			entry.Status&git2go.StatusConflicted != git2go.StatusConflicted {
			glog.Infof(`Skipping entry %s: not conflicted - status = %s`, entry.HeadToIndex.OldFile.Path,
				GitStatusToString(entry.Status))
			continue
		}

		// We're interested in the difference between Head and Index
		// Not entirely sure how I know this, other than that I've worked
		// it out by looking at examples/merge-origin test script
		file := entry.HeadToIndex.OldFile // This should be 'our' file
		if !chooseOurs {
			file = entry.HeadToIndex.NewFile // 'their' file
		}

		// Check that our filter function includes the file.
		// This allows us to reset a single file by providing an appropriate
		// filter function
		if nil != filter && !filter(r, file.Path, &entry) {
			continue
		}

		fullPath := r.RepoPath(file.Path)
		glog.Infof(`Considering %s with Oid = %s`, file.Path, file.Oid)
		glog.Infof(`Updating file %s`, file.Path)
		exists, raw, err := r.FileCat(file.Path, filePreference)
		if nil != err {
			return r.Error(err)
		}
		if !exists {
			// It seems for modified files in conflict, we can't rely on
			// the Oid being set for old- or new- : conflicted files can have
			// a 000 oid for New, while clearly being in conflict. I'm not sure
			// why this is, and whether I'm missing some configuration flag while
			// fetching file status.
			// TODO: Investigate about why we're getting a Zero OID here for a file
			// that clearly has existence in both repos.
			glog.Infof(`Deleting file %s`, file.Path)
			if err := os.Remove(fullPath); nil != err && !os.IsNotExist(err) {
				return r.Error(err)
			}
			return nil
		}
		if err := ioutil.WriteFile(fullPath, raw, 0644); nil != err {
			return r.Error(err)
		}
	}
	return nil
}

// AddToIndex adds the file at path to the index, if it exists, or
// deletes the file in the index if it does not exist.
func (r *Repo) AddToIndex(path string) error {
	return r.Git.AddToIndex(path)
}

// AddAllToIndex adds all staged files to the index, including deleting
// files from the index if they don't exist in the WD.
func (r *Repo) AddAllStagedFilesToIndex() error {
	return r.Git.AddAllStagedFilesToIndex()
}

// CommitAll works like `git commit -am` first adding all working-dir
// modified files to the index.
func (r *Repo) CommitAll(message, notes string) (*git2go.Oid, error) {
	if err := r.AddAllStagedFilesToIndex(); nil != err {
		return nil, err
	}
	return r.Commit(message, notes)
}

// Commit commits the changes on the repo with the given message.
func (r *Repo) Commit(message string, notes string) (*git2go.Oid, error) {
	return r.Git.Commit(message)
}

// CleanupConflictTemporaryFiles cleans up any temporary files used in a
// conflict resolution.
func (r *Repo) CleanupConflictTemporaryFiles() error {
	if err := r.WorkingTree().Cleanup(); nil != err {
		return err
	}
	if err := r.TheirTree().Cleanup(); nil != err {
		return err
	}
	return nil
}

// CloseConflict closes the conflict on the repo, including
// closing PR's if PR merges are in process.
func (r *Repo) CloseConflict(message, notes string) error {
	if _, err := r.CommitAll(message, notes); nil != err {
		return err
	}

	// @deprecated: all this now happens in Git.commit and
	// it's call through to Git.mergeCleanup()

	// if 0 < r.EBWRepoStatus.MergingPRNumber {
	// 	if err := PullRequestClose(r.Client,
	// 		r.RepoOwner, r.RepoName, r.EBWRepoStatus.MergingPRNumber); nil != err {
	// 		return err
	// 	}
	// }

	// r.EBWRepoStatus.MergingPRNumber = 0
	// r.EBWRepoStatus.MergingFiles = []string{}
	// r.EBWRepoStatus.MergingDescription = ``
	// if err := r.writeEBWRepoStatus(); nil != err {
	// 	return err
	// }

	// if err := r.CleanupConflictTemporaryFiles(); nil != err {
	// 	return err
	// }

	// return r.Cleanup()
	return nil
}

// Cleanup cleans up the state of the repo, and also removes any temporary
// files that a merge or conflict state might have created. This is probably
// only necessary to call from CloseConflict - any other version should not
// be required.
func (r *Repo) Cleanup() error {
	if err := r.Repository.StateCleanup(); nil != err {
		return r.Error(err)
	}
	return r.CleanupConflictTemporaryFiles()
}

// Push implements 'git push remote branch' for the repo.
// TODO: Check whether my ref string is able to push not just
// from our master-to-master, but also from master -> x or x -> y
func (r *Repo) Push(remoteName, branchName string) error {
	return r.Git.Push(remoteName, branchName)
}

// WorkingTree returns a FileTree instance into the working
// directory for the repo.
func (r *Repo) WorkingTree() *FileTree {
	return &FileTree{
		Path:      r.RepoPath,
		Temporary: false,
	}
}

// TheirTree returns a FileTree instance into the
// merge-conflict temporary `their` tree
func (r *Repo) TheirTree() *FileTree {
	return &FileTree{
		Path:      r.TheirPath,
		Temporary: true,
	}
}

// IndexEntry returns the libgit2 entry from the Index for the
// given path.
func (r *Repo) IndexEntry(path string) (*git2go.IndexEntry, error) {
	index, err := r.Index()
	if nil != err {
		return nil, r.Error(err)
	}
	defer index.Free()
	i, err := index.Find(path)
	if nil != err {
		return nil, r.Error(err)
	}
	entry, err := index.EntryByIndex(i)
	if nil != err {
		return nil, r.Error(err)
	}
	return entry, nil
}

// FileInfoFromIndex returns FileInfo for the given path
// from the Index
func (r *Repo) FileInfoFromIndex(path string) (*FileInfo, error) {
	entry, err := r.IndexEntry(path)
	if nil != err {
		glog.Errorf(`FileInfoFromIndex got error %v`, err)
		if git2go.IsErrorCode(err, git2go.ErrNotFound) {
			return &FileInfo{
				Path: path,
				Hash: &git2go.Oid{},
			}, nil
		}
		return nil, err
	}
	id := entry.Id
	if nil == id {
		id = &git2go.Oid{}
	} else {
		obj, err := r.Lookup(id)
		defer obj.Free()
		b, err := obj.AsBlob()
		defer b.Free()
		// Git's object Id isn't a direct hash of the contents, but
		// includes a prefix. Since I can't calculate this for
		// regular files, here I calculate the hash fo the blob
		// contents only.
		if nil != err {
			return nil, r.Error(fmt.Errorf("ERROR ON AsBlob() for %s: %s\n", path, err.Error()))
		} else {
			h := sha1.New()
			h.Write(b.Contents())
			id = git2go.NewOidFromBytes(h.Sum(nil))
		}
	}
	return &FileInfo{
		Hash: id,
		Path: path,
	}, nil
}

// MergeFileInfo returns the MergeFileInfo for the named
// path in the Working dir, the Their dir, and the Index
func (r *Repo) MergeFileInfo(path string) (*MergeFileInfo, error) {
	index, err := r.FileInfoFromIndex(path)
	if nil != err {
		return nil, err
	}
	working, err := NewFileInfoFromPath(r.WorkingTree().Path(path))
	if nil != err {
		return nil, err
	}
	their, err := NewFileInfoFromPath(r.TheirTree().Path(path))
	if nil != err {
		return nil, err
	}
	return &MergeFileInfo{
		Working: working,
		Their:   their,
		Index:   index,
	}, nil
}

// MergeWith merges the repo with the given remote and branch, and configures
// all the EBW Server required configurations for correct conflict management.
// At present MergeWith will not work on the command line unless the user is
// within a EBW Server structured git repo.
func (r *Repo) MergeWith(remote, branch string, resolve ResolveMergeOption, conflicted bool, prNumber int, description string) error {
	if 0 == prNumber {
		glog.Infof(`Pull`)
		if err := r.Pull(remote, branch); nil != err {
			return err
		}
	} else {
		glog.Infof(`PullRequestFetch`)
		if err := r.PullRequestFetch(prNumber, nil); nil != err {
			return err
		}
		glog.Infof(`PullRequestMerge`)
		if err := r.PullRequestMerge(prNumber); nil != err {
			return err
		}
	}
	switch resolve {
	case ResolveMergeOur:
		glog.Infof(`ResetConflictedFilesInWorkingDir`)
		if err := r.ResetConflictedFilesInWorkingDir(true, conflicted, nil); nil != err {
			return err
		}
	case ResolveMergeTheir:
		glog.Infof(`ResetConflictedFilesInWorkingDir`)
		if err := r.ResetConflictedFilesInWorkingDir(false, conflicted, nil); nil != err {
			return err
		}
	}

	// Synchronize the TheirTree with the FileTheir items
	glog.Infof(`TheirTree.Sync`)
	if err := r.TheirTree().Sync(r, FileTheir); nil != err {
		return err
	}

	// Set our EBWRepoStatus configuration file, so that we have
	// full meta-data information on this merge, even after we've
	// messed with the filesystem / index.
	r.EBWRepoStatus.MergingDescription = description
	glog.Infof(`StatusListFilenames`)
	files, err := r.StatusListFilenames()
	if nil != err {
		return err
	}
	r.EBWRepoStatus.MergingFiles = files
	if 0 < prNumber {
		r.EBWRepoStatus.MergingPRNumber = prNumber
	} else {
		r.EBWRepoStatus.MergingPRNumber = 0
	}

	glog.Infof(`writeEBWRepoStatus`)
	if err = r.writeEBWRepoStatus(); nil != err {
		return err
	}

	return nil
}

// MergingFilesList returns a slice of all the files in the
// repo that are merging, with a status indication for each.
func (r *Repo) MergingFilesList() ([]*IndexFileStatusAbbreviated, error) {
	return r.Git.MergingFilesList()
}

// MergeFileResolutionState returns the state of the merging file at the
// given path.
func (r *Repo) MergeFileResolutionState(path string) (MergeFileResolutionState, error) {
	return r.Git.mergeFileResolutionState(path)
}

// BranchCreate creates the named branch on the repo. The force param is
// set to true if you wish to overwrite an existing branch with the same
// name. If no name is provided, this function will assign a name based on
// the template PR_{{username}}_{{prN}} for the current head, where prN is the N+1 for N
// the total number of pull requests on the repo.
func (r *Repo) BranchCreate(name string, force bool) (string, *git2go.Oid, error) {
	head, err := r.Repository.Head()
	if nil != err {
		return ``, nil, util.Error(err)
	}
	defer head.Free()

	commit, err := r.LookupCommit(head.Target())
	if nil != err {
		return ``, nil, r.Error(err)
	}
	defer commit.Free()

	prCount, err := r.GetUpstreamPullRequestsCount()
	if nil != err {
		return ``, nil, err
	}

	if `` == name {
		r.HasUpstreamRemote()
		for i := prCount + 1; true; i++ {
			name = fmt.Sprintf(`PR_%s_%d_%s`, r.Client.Username, i, commit.Object.Id().String()[0:6])
			br, err := r.Repository.LookupBranch(name, git2go.BranchLocal)
			if nil != err {
				if git2go.IsErrorCode(err, git2go.ErrNotFound) {
					break
				}
				return ``, nil, r.Error(err)
			}
			br.Free()
		}
	}

	br, err := r.Repository.CreateBranch(name, commit, force)
	if nil != err {
		return ``, nil, r.Error(err)
	}
	br.Free()

	// Now we've created the branch on EBW, we need to push the branch to
	// GitHub
	if err := r.Push(`origin`, name); nil != err {
		return ``, nil, err
	}
	return name, head.Target(), err
}

// PullPR pulls the given PR into the repo, doing a our-their merge
// on conflicted files.
func (r *Repo) PullPR(prNumber int) error {
	// We revert local changes before pulling a PR - we should never
	// have local changes from using EBM
	if err := r.RevertLocalChanges(); nil != err {
		return err
	}
	// // TODO: Extract the description from the actual PR. - use
	// // OUR-THEIR on conflicted files only.
	// if err := r.MergeWith(``, ``, ResolveMergeOur, true, prNumber, fmt.Sprintf(`You are merging with PR number %d`, prNumber)); nil != err {
	// 	return err
	// }
	// if err := r.PullRequestFetch(prNumber, nil); nil != err {
	// 	return err
	// }
	if err := r.PullRequestMerge(prNumber); nil != err {
		return err
	}
	return nil
}

// CanPush returns true if the user can push to the repo.
func (r *Repo) CanPush() (bool, error) {
	repo, err := r.GithubRepo()
	if nil != err {
		return false, err
	}
	return repo.GetPermissions()[`push`], nil
}

// PullUpstream pulls the repos upstream into the repo, merging per
// git merge rules.
func (r *Repo) PullUpstream() error {
	// We revert local changes before pulling - we should never
	// have local changes from using EBM, since everything that is
	// saved is automatically added to the index. And we shouldn't be pulling
	// upstream if we haven't committed our index.
	if err := r.RevertLocalChanges(); nil != err {
		return err
	}
	// We ensure we've got an upstream remote
	if err := r.SetUpstreamRemote(); nil != err {
		return err
	}
	return r.Git.PullUpstream()
	// if err := r.MergeWith(`upstream`, `master`,
	// 	ResolveMergeGit, // resolve all files by git merge resolution
	// 	false,           // Use resolveMergeGit for conflicted and non-conflicted files
	// 	0,               // PR Number
	// 	`Merging with original series.`); nil != err {
	// 	return err
	// }
	// _, err := r.CommitIfNoConflicts()
	// if nil != err {
	// 	return err
	// }
	// return nil
}

// PullOrigin pulls the repos origin into the repo, merging per git merge
// rules.
func (r *Repo) PullOrigin() error {
	// We revert local changes before pulling - we should never
	// have local changes from using EBM
	if err := r.RevertLocalChanges(); nil != err {
		return err
	}
	return r.Git.PullOrigin()

	// if err := r.MergeWith(`origin`, `master`,
	// 	ResolveMergeGit, // resolve all files by git merge resolution
	// 	false,           // Use resolveMergeGit for conflicted and non-conflicted files
	// 	0,               // PR Number
	// 	`Merging with github.`); nil != err {
	// 	return err
	// }

	// _, err := r.CommitIfNoConflicts()
	// if nil != err {
	// 	return err
	// }

	// return nil
}

// CommitIfNoConflicts will commit the changes to the repo if there
// are no conflicted files in the repo.
// Returns true if the commit succeeded, false otherwise.
func (r *Repo) CommitIfNoConflicts() (bool, error) {
	hasConflicts, err := r.Git.HasConflicts()
	if nil != err {
		return false, err
	}
	if !hasConflicts {
		_, err := r.Commit(`merged`, `Auto-merged because no conflicts`)
		if nil != err {
			return false, err
		}
		return true, nil
	}
	return false, nil
}

// AutoProcessState runs automatic state processing on a repo, and returns
// true if the repo state has changed
func (r *Repo) AutoProcessState() (bool, error) {
	state, err := r.GetRepoState()
	if nil != err {
		return false, err
	}
	glog.Infof(`GetRepoState completed`)

	// If we're conflicted, we can't do anything except handle the conflict.
	if state.LocalConflicted() {
		return false, nil
	}
	glog.Infof(`not LocalConflicted`)
	// If we've got local changes, staged or unstaged, we don't
	// need in particular to do anything
	// if state.LocalChanges() {
	// }
	// if state.LocalChangesStaged() {
	// }
	// if state.LocalChangedUnstaged() {
	// }
	// If we're ahead, and not behind, we can PUSH
	if state.LocalAhead() && !state.LocalBehind() {
		glog.Infof(`LocalAhead() && !LocalBehind`)
		err := r.PushOrigin()
		glog.Infof(`PushOrigin completed`)
		if nil != err {
			return false, err
		}
		r.ResetState()
		glog.Infof(`ResetState completed`)
		return true, nil
	}
	// If we're behind, and have no local changes, we can PULL
	if state.LocalBehind() && !state.LocalAhead() && !state.LocalChanges() {
		glog.Infof(`LocalBehind && !LocalAhead && !LocalChanges`)
		err := r.PullOrigin()
		glog.Infof(`PullOrigin completed`)
		if nil != err {
			return false, err
		}
		r.ResetState()
		glog.Infof(`ResetState completed`)
		return true, nil
	}
	// ParentAhead and ParentBehind are handled by the user intervention
	// if state.ParentAhead() {
	// }
	// if state.ParentBehind() {
	// }
	return false, nil
}

// PushOrigin is a shorthand to push the repo to origin/master.
func (r *Repo) PushOrigin() error {
	return r.Git.Push(`origin`, `master`)
}

// RevertLocalChanges reverts all local changed files that aren't
// staged. Using EBM, we should never have local changes that aren't
// staged, so these files are generated by processes that run on the repo.
// We don't want to keep them, since they can cause issues with pulling
// new files.
func (r *Repo) RevertLocalChanges() error {
	deltas, err := r.DiffsIndexToWt()
	if nil != err {
		return err
	}
	for _, d := range deltas {
		if err := r.RevertDiffDelta(d); nil != err {
			return err
		}
	}
	return nil
}

// PrintLocalChanges prints all locally chnaged files that aren't staged.
func (r *Repo) PrintLocalChanges() error {
	deltas, err := r.DiffsIndexToWt()
	if nil != err {
		return err
	}
	for _, d := range deltas {
		fmt.Println(d)
	}
	return nil
}

// RunGit runs git in the repo directory with the given arguments.
func (r *Repo) RunGit(args ...string) error {
	return runGitDir(r.RepoPath(), args)
}

// SearchForFiles returns a list of all files that match the given regexp.
// It ignores all files that are ignored in Git, and skips all ignored directories.
func (r *Repo) SearchForFiles(fn string, filter func(in string) bool) ([]string, error) {
	glog.Infof(`SearchForFiles(%s)`, fn)
	if nil == r.Git {
		glog.Errorf(`r.Git is nil!`)
	}
	reg, err := regexp.Compile(fn)
	if nil != err {
		return nil, err
	}
	paths := []string{}
	repoPath := r.RepoPath()
	glog.Infof(`repoPath = %s`, repoPath)
	if err := filepath.Walk(r.RepoPath(), func(path string, fi os.FileInfo, err error) error {
		p, err := filepath.Rel(repoPath, path)
		if nil != err {
			return r.Error(err)
		}
		if `.` == p {
			return nil
		}
		ignore, err := r.Git.Repository.IsPathIgnored(p)
		if nil != err {
			return r.Error(err)
		}
		if fi.IsDir() {
			if ignore {
				return filepath.SkipDir
			}
			return nil
		}

		if !ignore && reg.MatchString(p) && (nil == filter || filter(p)) {
			paths = append(paths, p)
		}
		return nil
	}); nil != err {
		return nil, err
	}
	glog.Infof(`SearchForFiles returning: %v`, paths)
	return paths, nil
}

// UpdateFileBinary writes the given file and updates it in git.
func (r *Repo) UpdateFileBinary(path string, raw []byte) error {
	err := ioutil.WriteFile(r.RepoPath(path), raw, 0755)
	if nil != err {
		return r.Error(err)
	}
	if err := r.AddToIndex(path); nil != err {
		return r.Error(err)
	}
	return nil
}

// DumpIndex dumps the current contents of the git index to stdout
func (r *Repo) DumpIndex() error {
	idx, err := r.Repository.Index()
	if nil != err {
		return r.Error(err)
	}
	defer idx.Free()
	N := idx.EntryCount()
	for i := uint(0); i < N; i++ {
		e, err := idx.EntryByIndex(i)
		if nil != err {
			return r.Error(err)
		}
		fmt.Println(e.Path, e.Id.String())
	}
	return nil
}

// gitConfigure configures the user name and email for the repo.
func (r *Repo) gitConfigure() error {
	if err := r.Git.SetUsernameEmail(r.Client.Username, r.Client.User.GetEmail()); nil != err {
		return err
	}
	if err := r.Git.UpdateRemoteGithubIdentity(r.Client.Username, r.Client.Token); nil != err {
		return err
	}
	return nil
}

// gitUpdate updates the git repo from origin/master
func (r *Repo) gitUpdate() error {
	if err := r.gitConfigure(); nil != err {
		return err
	}
	if err := r.RunGit(`pull`, `origin`, `master`); nil != err {
		return err
	}
	return nil
}
