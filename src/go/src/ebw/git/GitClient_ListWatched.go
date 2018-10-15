package git

import (
	"github.com/golang/glog"
	"github.com/google/go-github/github"

	"ebw/util"
)

var _ = glog.Info

// ListWatched returns a list of all the repos that this client is
// watching.
func (gc *Client) ListWatched() ([]*github.Repository, error) {
	repos := []*github.Repository{}
	options := &github.ListOptions{}
	if err := GithubPaginate(options, func() (*github.Response, error) {
		r, res, err := gc.Client.Activity.ListWatched(gc.Context,
			gc.Username, options)
		if nil!=err {
			return nil, err
		}
		repos = append(repos, r...)
		return res, nil
	}); nil!=err {
		return nil, util.Error(err)
	}
	return repos, nil
}