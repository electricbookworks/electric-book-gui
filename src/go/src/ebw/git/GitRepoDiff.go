package git

import (
	"github.com/google/go-github/github"
	"github.com/golang/glog"
)
//compare two commits given a certain repo
func RepoDiffs(client *Client, repoName string, brA string, brB string) (*github.CommitsComparison, error) {
	c, _, err := client.Repositories.CompareCommits(client.Context, client.Username,
		repoName, brA, brB)

	if nil != err {
		glog.Errorf(`Error on repo diffs(%s): %s`, repoName, err.Error())
	}
	return c, nil
}
