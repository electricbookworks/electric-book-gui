package git

import (
	"fmt"

	"github.com/golang/glog"

	"ebw/util"
)

type RepoDiffStats struct {
	Ahead  int
	Behind int
}

func CompareCommits(client *Client, repoName string, repoOwnerA string,
	repoBranchA string, repoOwnerB string, repoBranchB string) (*RepoDiffStats, error) {
	cs := RepoDiffStats{}

	base := fmt.Sprintf("%s:%v", repoOwnerA, repoBranchA)
	head := fmt.Sprintf("%s:%v", repoOwnerB, repoBranchB)

	c, _, err := client.Repositories.CompareCommits(client.Context, repoOwnerA,
		repoName, base, head)
	if nil != err {
		glog.Errorf(`Error on repo diffs(%s, %s, %s, %s, %s): %s`, repoName, repoOwnerA, repoBranchA, repoOwnerB, repoBranchB, err.Error())
		// panic(err)
		return nil, util.Error(err)
	}
	cs.Ahead = c.GetAheadBy()
	cs.Behind = c.GetBehindBy()

	return &cs, nil
}
