package git

import (
	"github.com/golang/glog"
)

type RepoDiffStats struct {
	Ahead  int
	Behind int
}
//compare two commits given a certain repo
func RepoDiffs(client *Client, repoName string, brA string, brB string) (RepoDiffStats, error) {
	cs := RepoDiffStats{}
	c, _, err := client.Repositories.CompareCommits(client.Context, client.Username,
		repoName, brA, brB)

	if nil != err {
		glog.Errorf(`Error on repo diffs(%s): %s`, repoName, err.Error())
	}
	cs.Ahead = c.GetAheadBy()
	cs.Behind = c.GetBehindBy()

	return cs, nil
}
