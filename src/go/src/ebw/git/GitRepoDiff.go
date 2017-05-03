package git

import (
	"github.com/google/go-github/github"
	"github.com/golang/glog"
)


//given two branches return the comparison

func RepoDiffs(client *Client, repoName string, brA string, brB string) (*github.CommitsComparison, error) {
	comparison, _, err := client.Repositories.CompareCommits(client.Context, client.Username,
		repoName, brA, brB)

	if nil != err {
		glog.Errorf(`Error on repo diffs(%s): %s`, repoName, err.Error())
		return err
	}

	return comparison, nil
}

func GetAllBranches(client *Client, repoName string) ([]*github.Branch, error) {
	branchList, _, err := client.Repositories.ListBranches(client.Context,
		client.Username, repoName, nil)

	if nil != err {
		glog.Errorf(`Error on getallbranches(%s): %s`, repoName, err.Error())
	}
	return branchList, nil
}