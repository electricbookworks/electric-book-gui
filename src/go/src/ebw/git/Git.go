package git

import (
	"bufio"
	"bytes"
	"fmt"
	"io/ioutil"
	"net/url"
	"os"
	"path/filepath"
	"regexp"
	"strings"

	git2go "gopkg.in/libgit2/git2go.v25"

	"ebw/logger"
)

var _ = fmt.Print

// Git struct provides the commands that the command-line
// git repo would provide, with, perhaps, some slight additionals.
// Largely, it works off the git2go library, and manages a few
// presumed things about the library, but scanning for github username-password,
// etc.
type Git struct {
	Repository *git2go.Repository
	Log        logger.Logger
}

// OpenGit opens a Git Repo at the given directory, and configures the
// logger for the git repo
func OpenGit(repoDir string, log logger.Logger) (*Git, error) {
	if nil == log {
		log = logger.NewGlogLogger()
	}
	g := &Git{
		Log: log,
	}
	if err := g.resetRepository(repoDir); nil != err {
		return nil, err
	}
	return g, nil
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

// Close closes the git repo and frees any associated resources.
func (g *Git) Close() error {
	g.Repository.Free()
	return nil
}

// Error logs an error and returns an error, or returns nil if err is nil.
func (g *Git) Error(err error) error {
	if nil == err {
		return nil
	}
	g.Log.ErrorDepth(1, `%v`, err)
	return err
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

// FetchRemote fetches the named remote into our repo
func (g *Git) FetchRemote(remoteName string) error {
	remote, err := g.Repository.Remotes.Lookup(remoteName)
	if nil != err {
		return g.Error(err)
	}
	defer remote.Free()

	// if ``==username {
	// 	username, password, err := g.RemoteUser(remoteName)
	// 	if nil!=err {
	// 		return err
	// 	}
	// }

	if err := remote.Fetch([]string{}, &git2go.FetchOptions{
		RemoteCallbacks: git2go.RemoteCallbacks{
			CredentialsCallback: func(remoteUrl string, username_from_url string, allowed_types git2go.CredType) (git2go.ErrorCode, *git2go.Cred) {
				u, err := url.Parse(remoteUrl)
				if nil != err {
					g.Error(err)
					return git2go.ErrorCode(git2go.ErrAuth), nil
				}
				p, _ := u.User.Password()
				fmt.Println(`Using user='%s', pass='%s'`, u, p)
				errCode, cred := git2go.NewCredUserpassPlaintext(u.User.Username(), p)
				return git2go.ErrorCode(errCode), &cred
			},
		},
	}, ``); nil != err {
		return g.Error(err)
	}
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
