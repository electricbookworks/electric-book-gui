package git

import (
	// "fmt"
	"sync"
	"time"

	"github.com/golang/glog"
	"github.com/google/go-github/github"
	// "ebw/util"
)

type CommitInfo struct {
	LastModified time.Time
	Committer    string

	waiting sync.WaitGroup
}

// LastCommit returns the last commit for the given repo
func LastCommit(client *Client, repoName string) (*CommitInfo, error) {
	lc := &CommitInfo{
		waiting: sync.WaitGroup{},
	}
	lc.waiting.Add(1)
	go func() {
		defer lc.waiting.Done()
		// glog.Infof(`LastCommit: repoName = %s`, repoName)

		listOptions := github.ListOptions{
			Page: 0, PerPage: 1,
		}
		options := &github.CommitsListOptions{
			ListOptions: listOptions,
		}
		commits, _, err := client.Repositories.ListCommits(client.Context, client.Username,
			repoName, options)
		if nil != err {
			glog.Errorf(`Error on listCommits(%s): %s`, repoName, err.Error())
			return
		}
		if 0 == len(commits) {
			glog.Errorf(`No commits found for repo %s`, repoName)
			return
		}
		a := commits[0].Commit
		lc.LastModified = a.Committer.GetDate()
		lc.Committer = a.Committer.GetName()
		return
	}()
	return lc, nil
}
