package git

import (
	"fmt"
	"net/url"
	"os"
	"path/filepath"

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
	if `` == repoDir {
		var err error
		repoDir, err = os.Getwd()
		if nil != err {
			return nil, err
		}
	}
	repo, err := git2go.OpenRepositoryExtended(repoDir, 0, `/`)
	if nil != err {
		log.Error(err)
		return nil, err
	}
	return &Git{
		Repository: repo,
		Log:        log,
	}, nil
}

// Close closes the git repo and frees any associated resources.
func (g *Git) Close() error {
	g.Repository.Free()
	return nil
}

func (g *Git) Error(err error) error {
	if nil == err {
		return nil
	}
	g.Log.ErrorDepth(1, `%v`, err)
	return err
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

// SetRemoteUserPassword sets the username and password for the given remote
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
		u, err := url.Parse(p.Get())
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
