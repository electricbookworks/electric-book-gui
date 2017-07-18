package git

import (
	"github.com/google/go-github/github"
)

// GithubPaginate handles pagination across Github calls that require
// a ListOptions class to determine the pagination.
func GithubPaginate(list *github.ListOptions, get func() (*github.Response, error)) error {
	*list = github.ListOptions{
		Page:    0,
		PerPage: 30,
	}
	for {
		r, err := get()
		if nil != err {
			return err
		}
		if 0 == r.NextPage {
			return nil
		}
		list.Page = list.Page + 1
	}
	return nil
}
