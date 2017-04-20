package git

import (
	"sync"

	"github.com/golang/glog"
	"github.com/google/go-github/github"
)

type PullRequestInfo struct {
	PRCount int
	waiting sync.WaitGroup
}

// TotalPRs returns the number of prs for a repo
func TotalPRs(client *Client, userName, repoName string) (*PullRequestInfo, error) {
	if `` == userName {
		userName = client.Username
	}
	pr := &PullRequestInfo{
		waiting: sync.WaitGroup{},
	}
	pr.waiting.Add(1)
	go func() {
		defer pr.waiting.Done()
		listOptions := github.ListOptions{
			Page: 0, PerPage: 1,
		}
		options := &github.PullRequestListOptions{
			ListOptions: listOptions,
		}
		pullRequests, _, err := client.PullRequests.List(client.Context, userName,
			repoName, options)

		if nil != err {
			glog.Errorf(`Error on totalprs(%s): %s`, repoName, err.Error())
			return
		}
		if 0 == len(pullRequests) {
			glog.Errorf(`No pull requests found for repo %s`, repoName)
			return
		}
		pr.PRCount = len(pullRequests)
		return
	}()
	return pr, nil
}
