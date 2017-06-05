package git

import (
	"errors"
	"fmt"
	"os"
	"regexp"

	"github.com/golang/glog"
	"github.com/google/go-github/github"
	git2go "gopkg.in/libgit2/git2go.v25"

	"ebw/util"
)

var ErrNoGithubParent = errors.New(`This repo has no github parent: it was not forked.`)

type Repo struct {
	*git2go.Repository
	Dir string

	Client    *Client
	RepoOwner string
	RepoName  string
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
	return &Repo{
		Repository: repo,
		Dir:        repoDir,
		Client:     client,
		RepoOwner:  repoOwner,
		RepoName:   repoName,
	}, nil
}

func NewRepoForDir(client *Client, repoDir string) (*Repo, error) {
	repo, err := git2go.OpenRepository(repoDir)
	if nil != err {
		return nil, err
	}

	r := &Repo{
		Repository: repo,
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
		fmt.Printf(`- Status: %s
  HeadToIndex: 
    oldFile: %s
    newFile: %s
  IndexToWorkdir:
    oldFile: %s
    newFile: %s
`, GitStatusToString(se.Status),
			se.HeadToIndex.OldFile.Path,
			se.HeadToIndex.NewFile.Path,
			se.IndexToWorkdir.OldFile.Path,
			se.IndexToWorkdir.NewFile.Path)
	}
	return nil
}

func GitStatusToString(status git2go.Status) string {
	switch status {
	case git2go.StatusCurrent:
		return "StatusCurrent"
	case git2go.StatusIndexNew:
		return "StatusIndexNew"
	case git2go.StatusIndexModified:
		return "StatusIndexModified"
	case git2go.StatusIndexDeleted:
		return "StatusIndexDeleted"
	case git2go.StatusIndexRenamed:
		return "StatusIndexRenamed"
	case git2go.StatusIndexTypeChange:
		return "StatusIndexTypeChange"
	case git2go.StatusWtNew:
		return "StatusWtNew"
	case git2go.StatusWtModified:
		return "StatusWtModified"
	case git2go.StatusWtDeleted:
		return "StatusWtDeleted"
	case git2go.StatusWtTypeChange:
		return "StatusWtTypeChange"
	case git2go.StatusWtRenamed:
		return "StatusWtRenamed"
	case git2go.StatusIgnored:
		return "StatusIgnored"
	case git2go.StatusConflicted:
		return "StatusConflicted"
	}
	return "Status-UNKNOWN-"
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

func (r *Repo) SetUpstreamRemote() error {
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
		return err
	}
	remote, err := r.Remotes.Lookup(`upstream`)
	if nil != err {
		remote, err = r.Remotes.Create(`upstream`, upstreamUrl)
		if nil != err {
			return err
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

func (r *Repo) GetRepoState() (RepoState, error) {
	var state RepoState

	// Get the state of the local repository.
	switch r.State() {
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
	remote, err := FetchRemote(r.Repository, remoteName)
	if nil != err {
		return err
	}
	remote.Free()
	return nil
}

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

// PullAbort aborts a merge that is in progress.
func (r *Repo) PullAbort() error {
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
