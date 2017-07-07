package git

import (
	"crypto/sha1"
	"errors"
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"time"

	"github.com/golang/glog"
	"github.com/google/go-github/github"
	git2go "gopkg.in/libgit2/git2go.v25"

	"ebw/util"
)

type FileVersion int

const (
	FileAncestor FileVersion = 1
	FileOur                  = 2
	FileTheir                = 3
	FileWorking              = 4
)

var ErrNoGithubParent = errors.New(`This repo has no github parent: it was not forked.`)
var ErrNotInConflictedState = errors.New(`This repo is not in a conflicted state.`)

type Repo struct {
	*git2go.Repository
	Dir   string
	isCLI bool

	Client    *Client
	RepoOwner string
	RepoName  string

	EBWRepoStatus *EBWRepoStatus
}

func NewRepo(client *Client, repoOwner, repoName string) (*Repo, error) {
	repoDir, err := RepoDir(client.Username, repoOwner, repoName)
	if nil != err {
		return nil, err
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
	if 0 == len(path) {
		return r.Dir
	}
	parts := make([]string, len(path)+1)
	parts[0] = r.Dir
	copy(parts[1:], path)
	return filepath.Join(parts...)
}

// TheirPath returns the path to the `their` version of a file
// used during Merge resolution.
func (r *Repo) TheirPath(path ...string) string {
	if 0 == len(path) {
		return filepath.Join(filepath.Dir(r.Dir), `merge-their`)
	}
	parts := make([]string, len(path)+2)
	parts[0] = filepath.Dir(r.Dir)
	parts[1] = `merge-their`
	copy(parts[2:], path)
	return filepath.Join(parts...)
}

// ConfigPath returns the path mapped into the
// EBW `config` directory
func (r *Repo) ConfigPath(path ...string) string {
	if 0 == len(path) {
		return filepath.Join(filepath.Dir(r.Dir), `ebw-config`)
	}
	parts := make([]string, len(path)+2)
	parts[0] = filepath.Dir(r.Dir)
	parts[1] = `ebw-config`
	copy(parts[2:], path)
	return filepath.Join(parts...)
}

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
	}
	// RepoOwnerAndName will cache the owner and name resultss
	_, _, err = r.RepoOwnerAndName()
	if nil != err {
		fmt.Fprintf(os.Stderr, "%s\n", err.Error())
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
		return nil, err
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
		return 0, 0, err
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
		return 0, 0, err
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
	sl, err := r.Repository.StatusList(&git2go.StatusOptions{
		Show: git2go.StatusShowIndexOnly,
	})
	if nil != err {
		return nil, util.Error(err)
	}
	defer sl.Free()
	indexCount, err := sl.EntryCount()
	if nil != err {
		return nil, util.Error(err)
	}
	files := make([]*IndexFileStatus, indexCount)
	for i := 0; i < indexCount; i++ {
		se, err := sl.ByIndex(i)
		if nil != err {
			return nil, util.Error(fmt.Errorf(`Error retrieving StatusEntry %d: %s`, i, err.Error()))
		}
		files[i] = NewIndexFileStatus(se)
	}
	return files, nil
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
		return "RepositoryStateNone"
	case git2go.RepositoryStateMerge:
		return "RepositoryStateMerge"
	case git2go.RepositoryStateRevert:
		return "RepositoryStateRevert"
	case git2go.RepositoryStateCherrypick:
		return "RepositoryStateCherrypick"
	case git2go.RepositoryStateBisect:
		return "RepositoryStateBisect"
	case git2go.RepositoryStateRebase:
		return "RepositoryStateRebase"
	case git2go.RepositoryStateRebaseInteractive:
		return "RepositoryStateRebaseInteractive"
	case git2go.RepositoryStateRebaseMerge:
		return "RepositoryStateRebaseMerge"
	case git2go.RepositoryStateApplyMailbox:
		return "RepositoryStateApplyMailbox"
	case git2go.RepositoryStateApplyMailboxOrRebase:
		return "RepositoryStateApplyMailboxOrRebase"
	}
	return "State-UNKNOWN-"
}

// GithubRepo returns the github Repository for this repo.
func (r *Repo) GithubRepo() (*github.Repository, error) {
	repo, _, err := r.Client.Repositories.Get(r.Client.Context,
		r.RepoOwner, r.RepoName)
	return repo, err
}

// AddRemote adds the given remoteName with the given CloneURL,
// but does not change any existing remote with the given remoteName
func (r *Repo) AddRemote(remoteName string, remoteCloneURL string) error {
	remote, err := r.Remotes.Lookup(remoteName)
	if nil != err {
		remote, err = r.Remotes.Create(remoteName, remoteCloneURL)
		if nil != err {
			return util.Error(err)
		}
	}
	defer remote.Free()
	return nil
}

// SetUpstreamRemote configures the `upstream` remote in the
// github repo. It discovers the upstream remote by looking for
// the repo's parent on Github.
func (r *Repo) SetUpstreamRemote() error {
	// Sometimes the CLI might not have a Github repo,
	// so we handle this by simply declaring no github parent, which
	// is logically correct.
	if `` == r.RepoOwner {
		return ErrNoGithubParent
	}
	gr, err := r.GithubRepo()
	if nil != err {
		return err
	}
	if nil == gr.Parent {
		return ErrNoGithubParent
	}
	upstreamUrl, err := r.Client.AddAuth(`https://github.com/` +
		gr.Parent.Owner.GetLogin() + `/` + gr.Parent.GetName() + `.git`)
	if nil != err {
		return util.Error(err)
	}
	remote, err := r.Remotes.Lookup(`upstream`)
	if nil != err {
		remote, err = r.Remotes.Create(`upstream`, upstreamUrl)
		if nil != err {
			return util.Error(err)
		}
	}
	defer remote.Free()
	return nil
}

// HasUpstreamRemote returns true if the repo has an upstream
// remote - ie a parent to the github repo
func (r *Repo) HasUpstreamRemote() (bool, error) {
	if err := r.SetUpstreamRemote(); nil != err {
		if err == ErrNoGithubParent {
			return false, nil
		}
		return false, err
	}
	return true, nil
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
		return false, util.Error(err)
	}
	return r.EBWRepoStatus.LastPRHash != head.Target().String(), nil
}

func (r *Repo) GetRepoState() (RepoState, error) {
	var state RepoState

	// Get the state of the local repository.
	switch r.Repository.State() {
	case git2go.RepositoryStateNone:
	case git2go.RepositoryStateMerge:
		state |= EBMConflicted
	default:
		state |= EBMUnimplemented
	}

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

	// Check ahead/behind for our github repo and for our
	// parent repo. These are EBMAhead and EBMBehind.
	if err := r.FetchRemote(`origin`); nil != err {
		return 0, err
	}

	originBranch, err := r.Repository.LookupBranch(`origin/master`, git2go.BranchRemote)
	if nil != err {
		return 0, fmt.Errorf(`Failed to lookup branch origin/master: %s`, err.Error())
	}
	defer originBranch.Free()

	localHead, err := r.Repository.Head()
	if nil != err {
		return 0, fmt.Errorf(`Failed fetching head for local branch: %s`, err.Error())
	}
	defer localHead.Free()

	localAhead, localBehind, err := r.Repository.AheadBehind(localHead.Target(), originBranch.Target())
	if nil != err {
		return 0, fmt.Errorf(`Failed to get AheadBehind for local and origin branches: %s`, err.Error())
	}
	if 0 < localAhead {
		state |= EBMAhead
	}
	if 0 < localBehind {
		state |= EBMBehind
	}

	// A BRANCH points to a Commit, so we need to resolve
	// Check ahead/behind between our github repo and its parent
	hasUpstreamRemote, err := r.HasUpstreamRemote()
	if nil != err {
		return 0, err
	}
	if !hasUpstreamRemote {
		state |= ParentNotExist
	} else {
		if err := r.FetchRemote(`upstream`); nil != err {
			return 0, err
		}
		upstreamBranch, err := r.Repository.LookupBranch(`upstream/master`, git2go.BranchRemote)
		if nil != err {
			return 0, fmt.Errorf(`Failed to lookup branch upstream/master: %s`, err.Error())
		}
		defer upstreamBranch.Free()

		originAhead, originBehind, err := r.Repository.AheadBehind(originBranch.Target(), upstreamBranch.Target())
		if nil != err {
			return 0, fmt.Errorf(`Failed to get AheadBehind for origin and upstream branches: %s`, err.Error())
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
			fmt.Printf("OriginAhead = %d, OriginBehind = %d\n", originAhead, originBehind)
		}
	}
	if 0 == state&(EBMAhead|EBMBehind|EBMConflicted|EBMUnimplemented|EBMChangesStaged|EBMChangesUnstaged) {
		state |= EBMInSync
	}
	return state, nil
}

// FetchRemote fetches the named remote for the repo.
func (r *Repo) FetchRemote(remoteName string) error {
	// We're assuming that our configured repo has the right permissions,
	// which we should probably check
	remote, err := r.Remotes.Lookup(remoteName)
	if nil != err {
		return util.Error(err)
	}
	defer remote.Free()
	if err := remote.Fetch([]string{}, nil, ``); nil != err {
		return util.Error(err)
	}
	return nil
}

// Stash stashes all current working directory files with the given message.
func (r *Repo) Stash(msg string) (*git2go.Oid, error) {
	sig, err := r.DefaultSignature()
	if nil != err {
		return nil, util.Error(err)
	}
	oid, err := r.Stashes.Save(sig, msg, git2go.StashIncludeUntracked)
	if nil != err {
		return nil, util.Error(err)
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
		return util.Error(err)
	}
	defer remote.Free()

	branchReference, err := r.References.Lookup(`refs/remotes/` + remoteName + `/` + branchName)
	if nil != err {
		return util.Error(err)
	}
	defer branchReference.Free()
	remoteCommit, err := r.LookupAnnotatedCommit(branchReference.Target())
	if nil != err {
		return util.Error(err)
	}
	defer remoteCommit.Free()

	return r.mergeAnnotatedCommit(remoteCommit)
}

// mergeAnnotatedCommit does an actual merge of the given AnnotatedCommit
// with the HEAD of the repo.
func (r *Repo) mergeAnnotatedCommit(remoteCommit *git2go.AnnotatedCommit) error {
	analysis, _, err := r.MergeAnalysis([]*git2go.AnnotatedCommit{remoteCommit})
	if nil != err {
		return util.Error(err)
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

	// master, err := repo.LookupBranch(`origin/master`, git2go.BranchRemote)
	// if nil != err {
	// 	return err
	// }
	defaultMergeOptions, err := git2go.DefaultMergeOptions()
	if nil != err {
		return err
	}
	if err := r.Repository.Merge([]*git2go.AnnotatedCommit{remoteCommit},
		&defaultMergeOptions,
		// &git2go.MergeOptions{},
		nil,
		//&git2go.CheckoutOpts{},
	); nil != err {
		fmt.Fprintf(os.Stderr, "ERROR on Merge: %s\n", err.Error())
		return err
	}
	return nil
}

// PullAbort aborts a merge that is in progress. This isn't quite
// live `git merge --abort`, because this is in fact simply a RESET
// to HEAD, which occurs in spite of, or while ignoring, any changed
// files in WD. `git merge --abort`, though, will fail if there are modified
// files in WD (or something like that).
func (r *Repo) PullAbort() error {
	if err := r.Cleanup(); nil != err {
		return err
	}
	head, err := r.Repository.Head()
	if nil != err {
		return util.Error(err)
	}
	commit, err := r.LookupCommit(head.Target())
	if nil != err {
		return util.Error(err)
	}
	defer commit.Free()
	if err := r.Repository.ResetToCommit(commit, git2go.ResetHard, nil); nil != err {
		return util.Error(err)
	}
	return nil
}

// treeForCommit converts a *Oid into a *Tree. It's just here as a utility
// function.
func (r *Repo) treeForCommit(commitId *git2go.Oid) (*git2go.Tree, error) {
	co, err := r.Repository.Lookup(commitId)
	if nil != err {
		return nil, util.Error(err)
	}
	c, err := co.AsCommit()
	if nil != err {
		return nil, util.Error(err)
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
	commits := []*git2go.Commit{}

	//Getting repo HEAD
	if includeHead {
		head, err := r.Repository.Head()
		if err != nil {
			return nil, util.Error(err)
		}
		defer head.Free()

		headCommit, err := r.LookupCommit(head.Target())
		if err != nil {
			return nil, util.Error(err)
		}
		commits = append(commits, headCommit)
	}

	mergeHeads, err := r.Repository.MergeHeads()
	if nil != err {
		return nil, util.Error(err)
	}
	for _, h := range mergeHeads {
		obj, err := r.Repository.Lookup(h)
		if nil != err {
			return nil, util.Error(err)
		}
		c, err := obj.AsCommit()
		if nil != err {
			return nil, util.Error(err)
		}
		commits = append(commits, c)
	}
	return commits, nil
}

// FileCat returns the contents of a conflicted or merged file.
// The first bool parameter indicates whether the files exists.
func (r *Repo) FileCat(path string, version FileVersion) (bool, []byte, error) {
	var fileId *git2go.Oid
	if FileWorking == version {
		exists, err := util.FileExists(r.RepoPath(path))
		if nil != err {
			return false, []byte{}, err
		}
		if !exists {
			return false, []byte{}, nil
		}
		raw, err := ioutil.ReadFile(r.RepoPath(path))
		if nil != err {
			return false, []byte{}, util.Error(err)
		}
		return true, raw, err
	}
	switch version {
	case FileTheir:
		mergeHeads, err := r.MergeHeads()
		if nil != err {
			return false, []byte{}, util.Error(err)
		}
		if 1 != len(mergeHeads) {
			return false, []byte{}, util.Error(fmt.Errorf(`Expected 1 MERGE_HEAD, but got %d`, len(mergeHeads)))
		}

		tree, err := r.treeForCommit(mergeHeads[0])
		if nil != err {
			return false, []byte{}, util.Error(err)
		}

		te, err := tree.EntryByPath(path)
		if nil != err {
			if git2go.IsErrorCode(err, git2go.ErrNotFound) {
				return false, []byte{}, nil
			}

			return false, []byte{}, util.Error(err)
		}
		fileId = te.Id
	case FileOur:
		headRef, err := r.Head()
		if nil != err {
			return false, []byte{}, util.Error(err)
		}
		tree, err := r.treeForCommit(headRef.Target())
		if nil != err {
			return false, []byte{}, util.Error(err)
		}
		te, err := tree.EntryByPath(path)
		if nil != err {
			if git2go.IsErrorCode(err, git2go.ErrNotFound) {
				return false, []byte{}, nil
			}
			return false, []byte{}, util.Error(err)
		}
		fileId = te.Id
	default:
		index, err := r.Repository.Index()
		if nil != err {
			return false, []byte{}, util.Error(err)
		}
		conflict, err := index.GetConflict(path)
		if nil != err {
			// An error can occur if the file is not conflicted
			return false, []byte{}, util.Error(err)
		}
		switch version {
		case FileAncestor:
			fileId = conflict.Ancestor.Id
		case FileOur:
			fileId = conflict.Our.Id
		case FileTheir:
			fileId = conflict.Their.Id
		default:
			return false, []byte{}, util.Error(fmt.Errorf(`FileVersion version=%d not implemented`, version))
		}
	}

	if fileId.IsZero() {
		// I'm guessing this could occur if the file does not exist
		glog.Infof(`Got fileId IsZero() for %s (v=%d)`, path, version)
		return false, []byte{}, nil
	}
	file, err := r.Repository.Lookup(fileId)
	if nil != err {
		return false, []byte{}, util.Error(err)
	}
	defer file.Free()
	blob, err := file.AsBlob()
	if nil != err {
		return false, []byte{}, util.Error(err)
	}
	return true, blob.Contents(), nil
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
		return util.Error(err)
	}
	for i := 0; i < N; i++ {
		entry, err := statusList.ByIndex(i)
		if nil != err {
			return util.Error(err)
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
			return err
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
				return util.Error(err)
			}
			return nil
		}
		if err := ioutil.WriteFile(fullPath, raw, 0644); nil != err {
			return util.Error(err)
		}
	}
	return nil
}

// AddToIndex adds the file at path to the index, if it exists, or
// deletes the file in the index if it does not exist.
func (r *Repo) AddToIndex(path string) error {
	index, err := r.Index()
	if nil != err {
		return util.Error(err)
	}
	defer index.Free()
	exists, err := util.FileExists(r.RepoPath(path))
	if nil != err {
		return err
	}
	if exists {
		if err = index.AddByPath(path); nil != err {
			// Adding a pre-existing file shouldn't be an issue,
			// since it's the file contents, not the file name,
			// that is important about the adding.
			return util.Error(err)
		}
	} else {
		if err = index.RemoveByPath(path); nil != err {
			// I might need to consider what happens if I
			// remove a file that isn't in the Index.
			return util.Error(err)
		}
	}
	if err := index.Write(); nil != err {
		return util.Error(err)
	}
	return nil
}

// AddAllToIndex adds all staged files to the index, including deleting
// files from the index if they don't exist in the WD.
func (r *Repo) AddAllStagedFilesToIndex() error {
	files, err := r.StagedFiles()
	if nil != err {
		return err
	}
	for _, f := range files {
		if err = r.AddToIndex(f.Path()); nil != err {
			return err
		}
	}
	return nil
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
	author := &git2go.Signature{
		Name:  r.Client.Username,
		Email: r.Client.User.GetEmail(),
		When:  time.Now(),
	}
	// TODO: If we don't have a User Email address,
	// where can we get one?
	if `` == author.Email {
		author.Email = author.Name
	}
	glog.Infof(`Committing with signatures Name:%s, Email:%s`, r.Client.Username, r.Client.User.GetEmail())
	index, err := r.Index()
	if nil != err {
		return nil, util.Error(err)
	}
	defer index.Free()
	treeId, err := index.WriteTree()
	if nil != err {
		return nil, util.Error(err)
	}
	tree, err := r.LookupTree(treeId)
	if nil != err {
		return nil, util.Error(err)
	}
	defer tree.Free()

	//Getting repo HEAD
	head, err := r.Head()
	if err != nil {
		return nil, util.Error(err)
	}
	defer head.Free()

	commits, err := r.MergeCommits(true)
	if nil != err {
		return nil, err
	}
	defer FreeCommitSlice(commits)

	oid, err := r.CreateCommit(`HEAD`, author, author, message, tree, commits...)
	if nil != err {
		return nil, util.Error(err)
	}
	glog.Infof(`COMMIT Created: oid = %s`, oid.String())

	return oid, nil
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

	if 0 < r.EBWRepoStatus.MergingPRNumber {
		if err := PullRequestClose(r.Client,
			r.RepoOwner, r.RepoName, r.EBWRepoStatus.MergingPRNumber); nil != err {
			return err
		}
	}

	r.EBWRepoStatus.MergingPRNumber = 0
	r.EBWRepoStatus.MergingFiles = []string{}
	r.EBWRepoStatus.MergingDescription = ``
	if err := r.writeEBWRepoStatus(); nil != err {
		return err
	}

	if err := r.CleanupConflictTemporaryFiles(); nil != err {
		return err
	}

	return r.Cleanup()
}

// Cleanup cleans up the state of the repo, and also removes any temporary
// files that a merge or conflict state might have created. This is probably
// only necessary to call from CloseConflict - any other version should not
// be required.
func (r *Repo) Cleanup() error {
	if err := r.Repository.StateCleanup(); nil != err {
		return util.Error(err)
	}
	return r.CleanupConflictTemporaryFiles()
}

// Push implements 'git push remote branch' for the repo.
// TODO: Check whether my ref string is able to push not just
// from our master-to-master, but also from master -> x or x -> y
func (r *Repo) Push(remoteName, branchName string) error {
	remote, err := r.Repository.Remotes.Lookup(remoteName)
	if nil != err {
		return util.Error(err)
	}
	defer remote.Free()
	ref := fmt.Sprintf(`+refs/heads/%s`, branchName)
	if err = remote.Push([]string{ref}, &git2go.PushOptions{}); nil != err {
		return util.Error(err)
	}
	return nil
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
		return nil, util.Error(err)
	}
	defer index.Free()
	i, err := index.Find(path)
	if nil != err {
		if git2go.IsErrorCode(err, git2go.ErrNotFound) {
			glog.Errorf(`ERROR IS ErrNotFound`)
		}
		return nil, util.Error(err)
	}
	entry, err := index.EntryByIndex(i)
	if nil != err {
		return nil, util.Error(err)
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
			return nil, fmt.Errorf("ERROR ON AsBlob for %s: %s\n", path, err.Error())
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
		if err := r.Pull(remote, branch); nil != err {
			return err
		}
	} else {
		if err := r.PullRequestFetch(prNumber); nil != err {
			return err
		}
		if err := r.PullRequestMerge(prNumber); nil != err {
			return err
		}
	}
	switch resolve {
	case ResolveMergeOur:
		if err := r.ResetConflictedFilesInWorkingDir(true, conflicted, nil); nil != err {
			return err
		}
	case ResolveMergeTheir:
		if err := r.ResetConflictedFilesInWorkingDir(false, conflicted, nil); nil != err {
			return err
		}
	}

	// Synchronize the TheirTree with the FileTheir items
	if err := r.TheirTree().Sync(r, FileTheir); nil != err {
		return err
	}

	// Set our EBWRepoStatus configuration file, so that we have
	// full meta-data information on this merge, even after we've
	// messed with the filesystem / index.
	r.EBWRepoStatus.MergingDescription = description
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

	if err = r.writeEBWRepoStatus(); nil != err {
		return err
	}

	return nil
}

// MergingFilesList returns a slice of all the files in the
// repo that are merging, with a status indication for each.
func (r *Repo) MergingFilesList() ([]*IndexFileStatusAbbreviated, error) {
	files := make([]*IndexFileStatusAbbreviated, len(r.EBWRepoStatus.MergingFiles))
	for i, path := range r.EBWRepoStatus.MergingFiles {
		rs, err := r.MergeFileResolutionState(path)
		if nil != err {
			return nil, err
		}
		f := &IndexFileStatusAbbreviated{
			Path:   path,
			Status: rs.String(),
		}
		files[i] = f
	}
	return files, nil
}

// MergeFileResolutionState returns the state of the merging file at the
// given path.
func (r *Repo) MergeFileResolutionState(path string) (MergeFileResolutionState, error) {
	info, err := r.MergeFileInfo(path)
	if nil != err {
		return MergeFileResolutionState(0), err
	}
	if info.Index.Hash.Equal(info.Working.Hash) {
		if info.Index.Hash.Equal(info.Their.Hash) {
			// our-their & repo are the same => RESOLVED
			return MergeFileResolved, nil
		}
		// theirs differs from ours - but for now I'm going to
		// differentiate this state
		return MergeFileModified, nil
	}
	// since working differs from index =>
	// implies modified, and hashes aren't the same,
	// so we are new or deleted or modified
	if info.Working.Hash.IsZero() {
		return MergeFileNew, nil
	}
	if info.Their.Hash.IsZero() {
		return MergeFileDeleted, nil
	}
	return MergeFileModified, nil
}

// BranchCreate creates the named branch on the repo. The force param is
// set to true if you wish to overwrite an existing branch with the same
// name. If no name is provided, this function will assign a name based on
// the template PR_{{prN}} for the current head, where prN is the Nth PR we've
// sent. Because, down-the-line, we might delete branches, this number isn't
// to be considered definitive.
func (r *Repo) BranchCreate(name string, force bool) (string, *git2go.Oid, error) {
	head, err := r.Repository.Head()
	if nil != err {
		return ``, nil, util.Error(err)
	}
	if `` == name {
		for i := 1; true; i++ {
			name = fmt.Sprintf(`PR_%d`, i)
			br, err := r.Repository.LookupBranch(name, git2go.BranchLocal)
			if nil != err {
				if git2go.IsErrorCode(err, git2go.ErrNotFound) {
					break
				}
				return ``, nil, util.Error(err)
			}
			br.Free()
		}
	}

	commit, err := r.LookupCommit(head.Target())
	if nil != err {
		return ``, nil, util.Error(err)
	}
	defer commit.Free()

	br, err := r.Repository.CreateBranch(name, commit, force)
	if nil != err {
		return ``, nil, util.Error(err)
	}
	br.Free()

	// Now we've created the branch on EBW, we need to push the branch to
	// GitHub
	if err := r.Push(`origin`, name); nil != err {
		return ``, nil, err
	}
	return name, head.Target(), err
}
