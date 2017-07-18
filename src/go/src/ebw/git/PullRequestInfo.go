package git

import (
	"sync"

	"github.com/golang/glog"
	"github.com/google/go-github/github"

	"ebw/util"
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
		options := &github.PullRequestListOptions{}
		pullRequests := []*github.PullRequest{}
		if err := GithubPaginate(&options.ListOptions, func() (*github.Response, error) {
			pr, res, err := client.PullRequests.List(client.Context,
				userName, repoName, options)
			if nil != err {
				return nil, util.Error(err)
			}
			pullRequests = append(pullRequests, pr...)
			return res, err
		}); nil != err {
			glog.Errorf(`Error on totalprs(%s): %s`, repoName, err.Error())
			return
		}
		if 0 == len(pullRequests) {
			//glog.Errorf(`No pull requests found for repo %s`, repoName)
			return
		}
		pr.PRCount = len(pullRequests)
		return
	}()
	return pr, nil
}
