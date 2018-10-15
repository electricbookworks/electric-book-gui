package git

import (
	"bufio"
	"bytes"
	"context"
	"fmt"
	"io"
	"io/ioutil"
	"net/url"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"time"

	"github.com/google/go-github/github"
	git2go "gopkg.in/libgit2/git2go.v25"
	"github.com/juju/errors"
	"github.com/golang/glog"

	"ebw/logger"
	"ebw/util"
)

var _ = fmt.Print

// Git struct provides the commands that the command-line
// git repo would provide, with, perhaps, some slight additionals.
// Largely, it works off the git2go library, and manages a few
// presumed things about the library, but scanning for github username-password,
// etc.
// It also manages the EBWRepoStatus, which is an extended-status form for
// a Git repo.
type Git struct {
	Context    context.Context
	Repository *git2go.Repository
	Log        logger.Logger

	// _fetchedCached caches remotes that have been fetched during this
	// session, so we can 'cheaply' call .FetchRemote without worrying
	// about the associated network costs.
	_fetchedCache map[string]bool

	github *github.Client
}

type GitRemoteAction int

const (
	GitRemoteActionNone     GitRemoteAction = 0
	GitRemoteActionCreatePR GitRemoteAction = 1
	GitRemoteActionPull                     = 2
)

func (ra GitRemoteAction) String() string {
	s := []string{}
	if ra.CanCreatePR() {
		s = append(s, `CreatePR`)
	}
	if ra.CanPull() {
		s = append(s, `Pull`)
	}
	if 0 == len(s) {
		return `No remote actions possible`
	}
	return strings.Join(s, ",")
}

func (ra GitRemoteAction) CanCreatePR() bool {
	return ra&GitRemoteActionCreatePR == GitRemoteActionCreatePR
}
func (ra GitRemoteAction) CanPull() bool {
	return ra&GitRemoteActionPull == GitRemoteActionPull
}
func (ra GitRemoteAction) InSync() bool {
	return GitRemoteActionNone == ra
}

// ConflictWalkFunc is the callback function to use with WalkConflicts
type ConflictWalkFunc func(git2go.IndexConflict) error

// OpenGit opens a Git Repo at the given directory, and configures the
// logger for the git repo
func OpenGit(repoDir string, log logger.Logger) (*Git, error) {
	if nil == log {
		log = logger.NewGlogLogger()
	}
	g := &Git{
		Context: context.Background(),
		Log:     log,
	}
	if err := g.resetRepository(repoDir); nil != err {
		return nil, err
	}
	return g, nil
}

// Adds all staged working dir files to the index.
func (g *Git) AddAllStagedFilesToIndex() error {
	files, err := g.StagedFiles()
	if nil != err {
		return err
	}
	for _, f := range files {
		if err = g.AddToIndex(f.Path()); nil != err {
			return err
		}
	}
	return nil
}

// AddRemote adds the named remote to Git with the given clone URL. If
// the remote already exists, AddRemote does not change it.
func (g *Git) AddRemote(remoteName, cloneURL string) error {
	remote, err := g.Repository.Remotes.Lookup(remoteName)
	if nil != err {
		remote, err = g.Repository.Remotes.Create(remoteName, cloneURL)
		if nil != err {
			return g.Error(err)
		}
	}
	remote.Free()
	return nil
}

// AddToIndex adds the file at path to the index, if it exists, or
// deletes the file in the index if it does not exist.
func (g *Git) AddToIndex(path string) error {
	index, err := g.Repository.Index()
	if nil != err {
		return g.Error(err)
	}
	defer index.Free()
	exists, err := util.FileExists(g.Path(path))
	if nil != err {
		return err
	}
	if exists {
		if err = index.AddByPath(path); nil != err {
			// Adding a pre-existing file shouldn't be an issue,
			// since it's the file contents, not the file name,
			// that is important about the adding.
			return g.Error(err)
		}
	} else {
		if err = index.RemoveByPath(path); nil != err {
			// If the file doesn't exist in the repo, I'm ok
			if !git2go.IsErrorCode(err, git2go.ErrNotFound) {
				return g.Error(err)
			}
		}
	}
	if err := index.Write(); nil != err {
		return g.Error(err)
	}
	return nil
}

// AheadBehind returns the commits that HEAD is ahead, and that HEAD is
// behind remote.
func (g *Git) AheadBehind(remoteName string) (int, int, error) {
	if err := g.FetchRemote(remoteName + "/master"); nil != err {
		return 0, 0, err
	}
	head, err := g.GetBranch(`HEAD`)
	if nil != err {
		return 0, 0, err
	}
	defer head.Free()
	remote, err := g.GetBranch(remoteName + "/master")
	if nil != err {
		return 0, 0, err
	}
	defer remote.Free()
	ahead, behind, err := g.Repository.AheadBehind(head.Id(), remote.Id())
	if nil != err {
		return 0, 0, g.Error(err)
	}

	remoteTree, err := remote.Peel(git2go.ObjectTree)
	if nil != err {
		return 0, 0, g.Error(err)
	}
	defer remoteTree.Free()
	headTree, err := head.Peel(git2go.ObjectTree)
	if nil != err {
		return 0, 0, g.Error(err)
	}
	defer headTree.Free()

	// isRemoteDescended, err := g.Repository.DescendantOf(remote.Id(), head.Id())
	// if nil != err {
	// 	return 0, 0, g.Error(err)
	// }
	// isHeadDescended, err := g.Repository.DescendantOf(head.Id(), remote.Id())
	// if nil != err {
	// 	return 0, 0, g.Error(err)
	// }

	return ahead, behind, nil
}

// Commit commits the staged changes on the repo with the given message.
// Commit also cleans up any meta-state that exists as a result of committing
// a merge- it closes PR's and updates the EBW status.
func (g *Git) Commit(message string) (*git2go.Oid, error) {
	author, err := g.DefaultSignature()
	if nil != err {
		return nil, err
	}
	index, err := g.Repository.Index()
	if nil != err {
		return nil, g.Error(err)
	}
	defer index.Free()

	treeId, err := index.WriteTree()
	if nil != err {
		return nil, g.Error(err)
	}
	tree, err := g.Repository.LookupTree(treeId)
	if nil != err {
		return nil, g.Error(err)
	}
	defer tree.Free()

	//Getting repo HEAD
	head, err := g.Repository.Head()
	if err != nil {
		return nil, g.Error(err)
	}
	defer head.Free()

	commits, err := g.mergeCommits(true)
	if nil != err {
		return nil, err
	}
	defer FreeCommitSlice(commits)

	oid, err := g.Repository.CreateCommit(`HEAD`, author, author, message, tree, commits...)
	if nil != err {
		return nil, g.Error(err)
	}
	if err = g.mergeCleanup(true); nil != err {
		return nil, g.Error(err)
	}
	// Now that we've committed, we should try to push to origin
	// BUT NOTE, we won't panic if we don't succeed, because there is the option that
	// origin is ahead, and the commit might fail - in which case the user will have to
	// manually manage the origin pull and merge before a push will succeed - but if
	// we can do this automatically here, good for us.
	if err := g.Push(`origin`, `master`); nil != err {
		g.Infof(`Failed push origin/master after commit: `, err.Error())
	}
	return oid, nil
}

// Close closes the git repo and frees any associated resources.
func (g *Git) Close() error {
	g.Repository.Free()
	return nil
}

// DefaultSignature guesses at a signature for the repo based on the
// git username and config
func (g *Git) DefaultSignature() (*git2go.Signature, error) {
	config, err := g.Repository.Config()
	if nil != err {
		return nil, g.Error(err)
	}
	defer config.Free()
	sig := &git2go.Signature{
		When: time.Now(),
	}
	sig.Name, _ = config.LookupString(`user.name`)
	if `` == sig.Name {
		sig.Name, _, err = g.RemoteUser(`origin`)
		if nil != err {
			return nil, err
		}
	}
	sig.Email, _ = config.LookupString(`user.email`)
	if `` == sig.Email {
		sig.Email = sig.Name
	}
	return sig, nil
}

// Error logs an error and returns an error, or returns nil if err is nil.
func (g *Git) Error(err error) error {
	if nil == err {
		return nil
	}
	g.Log.ErrorDepth(1, `%v`, err)
	return err
}


// GetUpstreamRemoteActions indicates the possible actions we could perform
// on upstream repo.
func (g *Git) GetUpstreamRemoteActions() (GitRemoteAction, error) {
	var action GitRemoteAction = GitRemoteActionNone
	remoteName := `upstream`
	if err := g.FetchRemote(remoteName + "/master"); nil != err {
		return GitRemoteActionNone, err
	}
	head, err := g.GetBranch(`HEAD`)
	if nil != err {
		return GitRemoteActionNone, err
	}
	defer head.Free()
	remote, err := g.GetBranch(remoteName + "/master")
	if nil != err {
		return GitRemoteActionNone, err
	}
	defer remote.Free()

	// FIRST WE CONSIDER WHETHER THE TWO TREEs ARE IDENTICAL.
	// THEY ARE IDENTICAL => we've pulled and merged without
	// file changes. There is absolutely nothing to do: neither
	// pull nor push.
	remoteTree, err := remote.Peel(git2go.ObjectTree)
	if nil != err {
		return GitRemoteActionNone, g.Error(err)
	}
	defer remoteTree.Free()
	headTree, err := head.Peel(git2go.ObjectTree)
	if nil != err {
		return GitRemoteActionNone, g.Error(err)
	}
	defer headTree.Free()
	// both repos have identical trees, so there's nothing to be done.
	if remoteTree.Id().String() == headTree.Id().String() {
		return GitRemoteActionNone, nil
	}

	// NOW WE CHECK WHETHER WE ARE AHEAD and BEHIND the REMOTE.
	// If we are ahead, we could send a PR, but first we check when
	// we last sent a PR, since there's no point in duplicating PR's.
	ahead, behind, err := g.Repository.AheadBehind(head.Id(), remote.Id())
	if nil != err {
		return GitRemoteActionNone, g.Error(err)
	}
	if 0 < ahead {
		ebw, err := g.readEBWRepoStatus()
		if nil != err {
			return GitRemoteActionNone, err
		}
		if ebw.LastPRHash != headTree.Id().String() {
			action = action | GitRemoteActionCreatePR
		}
	}

	// We are behind the remote => we can PULL
	if 0 < behind {
		action = action | GitRemoteActionPull
	}

	// isRemoteDescended, err := g.Repository.DescendantOf(remote.Id(), head.Id())
	// if nil != err {
	// 	return 0, 0, g.Error(err)
	// }
	// fmt.Println("remote is descendant of head = ", isRemoteDescended)
	// isHeadDescended, err := g.Repository.DescendantOf(head.Id(), remote.Id())
	// if nil != err {
	// 	return 0, 0, g.Error(err)
	// }
	// fmt.Println("head is descendant of remote = ", isHeadDescended)

	// return ahead, behind, nil

	return action, nil
}

func (g *Git) Infof(fmt string, args ...interface{}) {
	g.Log.InfoDepth(1, fmt, args...)
}

// FetchRefspecs fetches the refspecs for the named remote.
func (g *Git) FetchRefspecs(remoteName string) ([]string, error) {
	remote, err := g.Repository.Remotes.Lookup(remoteName)
	if nil != err {
		return nil, g.Error(err)
	}
	defer remote.Free()
	return remote.FetchRefspecs()
}

// FetchRemote fetches the named remote into our repo.
func (g *Git) FetchRemote(remoteName string) error {
	if nil == g._fetchedCache {
		g._fetchedCache = map[string]bool{}
	}
	if _, ok := g._fetchedCache[remoteName]; ok {
		return nil
	}
	if strings.Contains(remoteName, `/`) {
		parts := strings.Split(remoteName, `/`)
		remoteName = parts[0]
	}
	remote, err := g.Repository.Remotes.Lookup(remoteName)
	if nil != err {
		return g.Error(err)
	}
	defer remote.Free()
	if err := remote.Fetch([]string{}, &git2go.FetchOptions{
		RemoteCallbacks: git2go.RemoteCallbacks{
			CredentialsCallback: func(remoteUrl string, username_from_url string, allowed_types git2go.CredType) (git2go.ErrorCode, *git2go.Cred) {
				u, err := url.Parse(remoteUrl)
				if nil != err {
					g.Error(err)
					return git2go.ErrorCode(git2go.ErrAuth), nil
				}
				p, _ := u.User.Password()
				errCode, cred := git2go.NewCredUserpassPlaintext(u.User.Username(), p)
				return git2go.ErrorCode(errCode), &cred
			},
		},
	}, ``); nil != err {
		if strings.Contains(err.Error(), "404") {
			return g.Error(fmt.Errorf("We couldn't fetch that submission. Has the contributor given you access to their project?"))
		}
		return g.Error(fmt.Errorf("Failed on Git.FetchRemote(%s) of %s with %s.", remoteName, g.Path(``), err.Error()))
	}
	g._fetchedCache[remoteName] = true
	return nil
}

// GetBranch looks up the branch with the given name, where the name
// could be HEAD, a branch name, or a remote/branch name format.
func (g *Git) GetBranch(remoteBranch string) (*git2go.Object, error) {
	var err error
	parts := strings.Split(remoteBranch, `/`)
	if 2 < len(parts) {
		return nil, g.Error(fmt.Errorf(`Unrecognized format to branch '%s': expected remote/branch`, remoteBranch))
	}
	remote, branch := ``, ``
	if 2 == len(parts) {
		remote, branch = parts[0], parts[1]
	} else {
		branch = parts[0]
	}

	var ref *git2go.Reference
	if `` == remote {
		if `HEAD` == branch {
			ref, err = g.Repository.Head()
		} else {
			var b *git2go.Branch
			b, err = g.Repository.LookupBranch(branch, git2go.BranchLocal)
			if nil != b {
				ref = b.Reference
			}
		}
	} else {
		var b *git2go.Branch
		// refs/remotes/
		b, err = g.Repository.LookupBranch(fmt.Sprintf(`%s/%s`, remote, branch), git2go.BranchRemote)
		if nil != b {
			ref = b.Reference
		}
	}
	if nil != err {
		return nil, g.Error(err)
	}
	defer ref.Free()
	obj, err := g.Repository.Lookup(ref.Target())
	if nil != err {
		return nil, g.Error(err)
	}
	return obj, err
}

// ListDiffsIndexToWt returns the RepoDiffs for the difference between the
// index and the working tree.
func (g *Git) ListDiffsIndexToWt() ([]*DiffDelta, error) {
	slist, err := g.Repository.StatusList(&git2go.StatusOptions{
		Show:  git2go.StatusShowWorkdirOnly,
		Flags: 0,
		// PathSpec: nil,
	})
	if nil != err {
		return nil, g.Error(err)
	}
	defer slist.Free()
	n, err := slist.EntryCount()
	if nil != err {
		return nil, g.Error(err)
	}
	diffs := make([]*DiffDelta, 0, n)

	for i := 0; i < n; i++ {
		se, err := slist.ByIndex(i)
		if nil != err {
			return nil, g.Error(err)
		}
		if isWorktreeStatus(se.Status) {
			diffs = append(diffs, &DiffDelta{Type: IndexToWt, DiffDelta: se.IndexToWorkdir})
		}
	}

	return diffs, nil
}

// Path returns the disk-based path for the repo or any path inside the repo
func (g *Git) Path(path ...string) string {
	if 0 == len(path) {
		return g.Repository.Workdir()
	}
	return filepath.Join(g.Repository.Workdir(), filepath.Join(path...))
}

// PathEBWConfig returns the path to the ebw config directory
func (g *Git) PathEBWConfig(path ...string) string {
	base := []string{`.git`, `ebw-config`}
	if 0 == len(path) {
		return g.Path(base...)
	}
	parts := make([]string, len(base)+len(path))
	copy(parts, base)
	copy(parts[len(base):], path)
	return g.Path(parts...)
}

// PathTheir returns the path to the cached checkout of 'their' when a merge
// is in progress.
func (g *Git) PathTheir(path ...string) string {
	base := []string{`.git`, `ebw-config`, `merge-their`}
	if 0 == len(path) {
		return g.Path(base...)
	}
	parts := make([]string, len(base)+len(path))
	copy(parts, base)
	copy(parts[len(base):], path)
	return g.Path(parts...)
}

// Push pushes the current branch to the named remote and remote branch
func (g *Git) Push(remoteName, remoteBranch string) error {
	remote, err := g.Repository.Remotes.Lookup(remoteName)
	if nil != err {
		return g.Error(err)
	}
	defer remote.Free()
	ref := fmt.Sprintf(`+refs/heads/%s`, remoteBranch)
	g.Infof(`going to remote.Push with ref = %s`, ref)
	if err = remote.Push([]string{ref}, &git2go.PushOptions{}); nil != err {
		return g.Error(err)
	}
	return nil
}

// PrintEBWRepoStatus prints the info from the EBWRepoStatus
// to the io.Writer
func (g *Git) PrintEBWRepoStatus(out io.Writer) {
	rs, err := g.readEBWRepoStatus()
	if nil != err {
		fmt.Fprintln(out, err.Error())
		return
	}
	fmt.Fprintln(out, rs.ToYaml())
}

// RemoteUser returns the username and password of the remote git user.
func (g *Git) RemoteUser(remoteName string) (string, string, error) {
	remote, err := g.Repository.Remotes.Lookup(remoteName)
	if nil != err {
		return ``, ``, g.Error(err)
	}
	defer remote.Free()
	u, err := url.Parse(remote.Url())
	if nil != err {
		return ``, ``, g.Error(err)
	}
	if nil == u.User {
		return ``, ``, nil
	}
	p, _ := u.User.Password()
	return u.User.Username(), p, nil
}

// resetRepository initializes the git2go repository for the Git
// struct, and closes the repo if it already exists
func (g *Git) resetRepository(repoDir string) error {
	var err error
	if `` == repoDir {
		if nil == g.Repository {
			repoDir, err = os.Getwd()
			if nil != err {
				return g.Error(err)
			}
		} else {
			repoDir = g.Path()
		}
	}
	if nil != g.Repository {
		g.Repository.Free()
	}
	if g.Repository, err = git2go.OpenRepositoryExtended(repoDir, 0, `/`); nil != err {
		return g.Error(err)
	}
	return nil
}

// SetRemoteUserPassword sets the username and password for the given remote.
// It sets the fetch URL, and the pushurl if there is one configured.
func (g *Git) SetRemoteUserPassword(remoteName, username, password string) error {
	remote, err := g.Repository.Remotes.Lookup(remoteName)
	if nil != err {
		return g.Error(err)
	}
	defer remote.Free()
	for _, p := range []struct {
		Get func() string
		Set func(string, string) error
	}{
		{Get: remote.Url, Set: g.Repository.Remotes.SetUrl},
		{Get: remote.PushUrl, Set: g.Repository.Remotes.SetPushUrl},
	} {
		getUrl := p.Get()
		if `` == getUrl {
			continue
		}
		u, err := url.Parse(getUrl)
		if nil != err {
			return g.Error(err)
		}
		u.User = url.UserPassword(username, password)
		if err = p.Set(remoteName, u.String()); nil != err {
			return g.Error(err)
		}
	}
	return nil
}

// SetUsernameEmail sets the git user.name and user.email configuration
// values.
func (g *Git) SetUsernameEmail(name, email string) error {
	config, err := g.Repository.Config()
	if nil != err {
		return g.Error(err)
	}
	defer config.Free()
	if err = config.SetString(`user.name`, name); nil != err {
		return g.Error(err)
	}
	if `` != email {
		if err = config.SetString(`user.email`, email); nil != err {
			return g.Error(err)
		}
	}
	return nil
}

// SHAHead returns the SHA of the TREE of the HEAD of the repo as a string.
func (g *Git) SHAHead() (string, error) {
	head, err := g.Repository.Head()
	if nil != err {
		return ``, g.Error(err)
	}
	defer head.Free()
	tree, err := head.Peel(git2go.ObjectTree)
	if nil != err {
		return ``, g.Error(err)
	}
	defer tree.Free()
	return tree.Id().String(), nil
}

// SHARemote returns the SHA of the TREE of the HEAD of the remote repo as a string.
// If fetch is true, it will fetch the remote first.
func (g *Git) SHARemote(remoteName string, fetch bool) (string, error) {
	if fetch {
		if err := g.FetchRemote(remoteName); nil != err {
			return ``, err
		}
	}
	remoteCommit, err := g.GetBranch(remoteName + "/master")
	if nil != err {
		if git2go.IsErrorCode(err, git2go.ErrNotFound) {
			fmt.Printf("FAILED TO FIND %s remote\n", remoteName)
		}
		return ``, err
	}
	defer remoteCommit.Free()

	tree, err := remoteCommit.Peel(git2go.ObjectTree)
	if nil != err {
		return ``, g.Error(err)
	}
	defer tree.Free()

	return tree.Id().String(), nil
}

// StagedFiles returns a list of the files currently staged in the index.
func (g *Git) StagedFiles() ([]*IndexFileStatus, error) {
	sl, err := g.Repository.StatusList(&git2go.StatusOptions{
		Show: git2go.StatusShowIndexOnly,
	})
	if nil != err {
		return nil, g.Error(err)
	}
	defer sl.Free()
	indexCount, err := sl.EntryCount()
	if nil != err {
		return nil, g.Error(err)
	}
	files := make([]*IndexFileStatus, indexCount)
	for i := 0; i < indexCount; i++ {
		se, err := sl.ByIndex(i)
		if nil != err {
			return nil, g.Error(fmt.Errorf(`Error retrieving StatusEntry %d: %s`, i, err.Error()))
		}
		files[i] = NewIndexFileStatus(se)
	}
	return files, nil
}

// UpdateRemoteGithubIdentity updates all github remotes for the git repo
// inserting the given username and password for each URL.
func (g *Git) UpdateRemoteGithubIdentity(username, password string) error {
	configFile := g.Path(`.git`, `config`)
	raw, err := ioutil.ReadFile(configFile)
	if nil != err {
		return g.Error(err)
	}
	if err := ioutil.WriteFile(configFile+`-backup`, raw, 0644); nil != err {
		return g.Error(err)
	}
	out, err := os.Create(configFile)
	if nil != err {
		return g.Error(err)
	}
	defer out.Close()

	lines := bufio.NewScanner(bytes.NewReader(raw))
	match := regexp.MustCompile(`^(\s*(push)?url\s*=\s*https?://).*@github.com/`)
	repl := fmt.Sprintf(`%s:%s@github.com/`, username, password)
	for lines.Scan() {
		t := lines.Text()
		m := match.FindStringSubmatch(t)
		if nil != m {
			t = m[1] + repl + t[len(m[0]):]
		}
		fmt.Fprintln(out, t)
		// Don't know why, but this doesn't work :
		// fmt.Fprintln(out, match.ReplaceAllString(t, "$1" + repl))
	}
	// Reset the repository in case it has cached any remotes.
	// We need to do this here because we're interfering with git at a file-level,
	// rather than through the API, so by resetting we ensure that our Repository
	// will reload any necessary settings.
	if err = g.resetRepository(``); nil != err {
		return err
	}
	return nil
}

// WalkConflicts calls the ConflictWalkFunc for every conflict in the
// index.
func (g *Git) WalkConflicts(f ConflictWalkFunc) error {
	index, err := g.Repository.Index()
	if nil != err {
		return g.Error(err)
	}
	defer index.Free()
	iter, err := index.ConflictIterator()
	if nil != err {
		return g.Error(err)
	}
	defer iter.Free()
	for {
		conflict, err := iter.Next()
		if nil != err {
			if git2go.IsErrorCode(err, git2go.ErrIterOver) {
				break
			}
			return g.Error(err)
		}
		if err := f(conflict); nil != err {
			return err
		}
	}
	return nil
}

// TagDiff returns the difference between two tags / indexes that are given
func (g *Git) TagDiff(t1id, t2id string) error {
	t1oid, err := git2go.NewOid(t1id)
	if nil!=err {
		return g.Error(err)
	}
	t2oid, err := git2go.NewOid(t2id)
	if nil!=err {
		return g.Error(err)
	}
	t1, err := g.Repository.LookupTree(t1oid)
	if nil!=err {
		return g.Error(err)
	}
	defer t1.Free()
	t2, err := g.Repository.LookupTree(t2oid)
	if nil!=err {
		return g.Error(err)
	}
	defer t2.Free()
	diffOpts, err := git2go.DefaultDiffOptions()
	if nil!=err {
		return g.Error(err)
	}
	diff, err := g.Repository.DiffTreeToTree(t1, t2, &diffOpts)
	if nil!=err {
		return g.Error(err)
	}
	defer diff.Free()
	fmt.Println("Ok 1")
	return nil
}

func (g *Git) ListCommits() ([]*CommitSummary, error) {
	rv, err := g.Repository.Walk()
	if nil!=err {
		return nil, errors.Trace(err)
	}
	defer rv.Free()
	// rv.Reset()
	rv.PushHead()	// The the rev walker to have an initial position
	list := []*CommitSummary{}
	glog.Infof(`About to iterate through repository commits`)
	if err := rv.Iterate(func(c *git2go.Commit) bool {
		glog.Infof(`Commit : %s %10s %s`, 
			c.Committer().When.Format(`20060102`),
			c.TreeId().String(), c.Message())
		list = append(list, &CommitSummary{
			When: c.Committer().When,
			OID: c.TreeId().String(),
			Message: c.Message(),
			})
		return true
		}); nil!=err {
		return nil, errors.Trace(err)
	}
	return list, nil
}