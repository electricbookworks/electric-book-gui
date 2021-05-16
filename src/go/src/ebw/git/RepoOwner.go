package git

import (
	"net/url"
	"os"

	// "github.com/golang/glog"
	git2go "github.com/craigmj/git2go/v31"

	"ebw/util"
)

// GetUserForDir returns the user and token for the git repo containing
// the given directory. If an empty string is supplied as the directory, the
// current working directory is used instead.
func GetUserForDir(d string) (user, token string, err error) {
	if `` == d {
		d, err = os.Getwd()
		if nil != err {
			return ``, ``, util.Error(err)
		}
	}
	repo, err := git2go.OpenRepositoryExtended(d, 0, `/`)
	if nil != err {
		return ``, ``, util.Error(err)
	}
	defer repo.Free()

	origin, err := repo.Remotes.Lookup(`origin`)
	if nil != err {
		return ``, ``, util.Error(err)
	}
	defer origin.Free()

	u, err := url.Parse(origin.Url())
	if nil != err {
		return ``, ``, util.Error(err)
	}

	if nil == u.User {
		return ``, ``, ErrUnknownUser
	}
	password, ok := u.User.Password()
	if !ok {
		return ``, ``, ErrUnknownUser
	}

	return u.User.Username(), password, nil
}
