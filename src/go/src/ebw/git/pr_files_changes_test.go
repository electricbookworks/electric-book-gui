package git

import (
	"fmt"
	"time"
	"strings"
	"testing"

	"github.com/google/go-github/github"

	"ebw/cli/config"
)

func TestPRFilesChanged(t *testing.T) {
	forkOriginRepo(t)

	// We create a `test-origin` repo on user1
	// We write an a.txt and b.txt into that repo, and commit
	// We fork the repo to user2
	// We change b.txt and create c.txt
	// We commit and send a PR
	// We check that our PR testing code shows changes only to b.txt and c.txt
	// We delete both origin and fork

}

func stringPtr(a string) *string {
	return &a
}

// forkOriginRepo creates a new origin repo and forks it onto the
// second user.
func forkOriginRepo(t *testing.T) {
	const testRepo = `test1`
	if err := config.ReadConfigFile(``); nil!=err {
		t.Fatal(err)
	}
	user1, err := ClientFromCLIConfigNamed(`cmjtest1`)
	if nil!=err {
		t.Fatal(err)
		return
	}

	user2, err := ClientFromCLIConfigNamed(`cmjtest2`)
	if nil!=err {
		t.Fatal(err)
		return
	}

	// We delete the repo if it already exists	
	user1.Repositories.Delete(user1.Context, user1.Username, testRepo)
	// We delete the repo if it already exists
	user2.Repositories.Delete(user2.Context, user2.Username, testRepo)
	// and give github a moment to manage this
	time.Sleep(2*time.Second)


	// Create the origin repo
	originRepo, _, err := user1.Repositories.Create(user1.Context, ``, &github.Repository{
		Name: stringPtr(testRepo),
	})
	if nil!=err {
		t.Fatal(err)
		return
	}
	// defer func() {
	// 	if _,err := user1.Repositories.Delete(user1.Context, originRepo.Owner.GetLogin(), originRepo.GetName()); nil!=err {
	// 		t.Fatal(err)
	// 	}
	// }()

	// Write a.txt and b.txt into the origin repo
	_,_,err = user1.Repositories.CreateFile(user1.Context, 
		originRepo.Owner.GetLogin(), originRepo.GetName(),
		`a.txt`,
		&github.RepositoryContentFileOptions{
			Message: stringPtr(`a.txt import`),
			Content: []byte(`Hi there in a.txt`),
		},)
	if nil!=err {
		t.Fatal(err)
		return
	}

	_,_,err = user1.Repositories.CreateFile(user1.Context, 
		originRepo.Owner.GetLogin(), originRepo.GetName(),
		`b.txt`,
		&github.RepositoryContentFileOptions{
			Message: stringPtr(`b.txt import`),
			Content: []byte(`Hi there in b.txt`),
		},)
	if nil!=err {
		t.Fatal(err)
		return
	}

	time.Sleep(1*time.Second)

	// User2 Now forks cmjtest1/test1

	fork, _, err := user2.Repositories.CreateFork(user2.Context, 
		originRepo.Owner.GetLogin(), originRepo.GetName(),
		&github.RepositoryCreateForkOptions{},
		)
	if nil!=err {
		if !strings.Contains(err.Error(), `job scheduled`) {
			t.Fatal(err)
			return
		}
		time.Sleep(2*time.Second)
		fork, _, err = user2.Repositories.Get(user2.Context, user2.Username, originRepo.GetName())
		if nil!=err {
			t.Fatal(err)
			return
		}
	}
	// defer func() {
	// 	if _,err:=user2.Repositories.Delete(user2.Context, fork.Owner.GetLogin(), fork.GetName()); nil!=err{ 
	// 		t.Fatal(err)
	// 	}
	// }()

	// User2 changes b.txt and adds c.txt

	err = updateFile(user2, fork.Owner.GetLogin(), fork.GetName(),
		`b.txt`,
		`b.txt changes from user2`, `Hi there in b.txt from user2`)
	if nil!=err {
		t.Fatal(err)
		return
	}	

	_,_,err = user2.Repositories.CreateFile(user2.Context, 
		fork.Owner.GetLogin(), fork.GetName(),
		`c.txt`,
		&github.RepositoryContentFileOptions{
			Message: stringPtr(`c.txt import from user2`),
			Content: []byte(`Hi there in c.txt from user2`),
		},)
	if nil!=err {
		t.Fatal(err)
		return
	}	

	// User1 changes a.txt
	err = updateFile(user1, originRepo.Owner.GetLogin(), originRepo.GetName(),
		`a.txt`,
		`a.txt changes`, `Hi there in a.txt - these changes are made by user1`)
	if nil!=err {
		t.Fatal(err)
		return
	}	

	// User2 makes a PR to user1
	pr, _, err := user2.PullRequests.Create(user2.Context, 
		originRepo.Owner.GetLogin(), originRepo.GetName(),
		&github.NewPullRequest{
			Title: stringPtr(`changed b.txt and added c.txt`),
			Head: stringPtr(fmt.Sprintf(`%s:%s`, fork.Owner.GetLogin(), `master`)),// fork.GetName())),
			Base: stringPtr(`master`),
			Body: stringPtr(`Please pull these changes`),
			},
		)
	if nil!=err {
		t.Fatal(err)
		return
	}

	files, _, err := user1.PullRequests.ListFiles(user1.Context, originRepo.Owner.GetLogin(),
		originRepo.GetName(),
		pr.GetNumber(), &github.ListOptions{
			PerPage: 1000,
			})
	if nil!=err {
		t.Fatal(err)
		return
	}
	if 2!=len(files) {
		t.Fatalf(`Expected only 2 files in the PR, but got %d`, len(files))
		return
	}
	findFile := func(n string) *github.CommitFile {
		for _, f := range files {
			if f.GetFilename()==n {
				return f
			}
		}
		return nil
	}
	for _, f :=range []string{`b.txt`,`c.txt`} {
		if nil==findFile(f) {
			t.Fatalf(`Expected to find %s in pullrequest files, but didn't`, f)
		}
	}

	diffs, err := PullRequestDiffList(user1, originRepo.Owner.GetLogin(), originRepo.GetName(),
		pr)
	if nil!=err {
		t.Fatal(err)
		return
	}
	if 2!=len(diffs) {
		t.Fatalf(`Expected only 2 diffs in the PR, but got %d`, len(diffs))
		return
	}
	findDiff := func(n string) bool {
		for _, f := range diffs {
			if f.Path==n {
				return true
			}
		}
		return false
	}
	for _, f := range []string{`b.txt`,`c.txt`} {
		if !findDiff(f) {
			t.Fatalf(`Expected to find diff for %s in pullrequest, but didn't`, f)
		}
	}
}

func updateFile(client *Client, repoOwner, repoName string, path string, message, newContent string) error {
	c, _, _, err := client.Repositories.GetContents(client.Context, repoOwner, repoName, path, 
		&github.RepositoryContentGetOptions{})
	if nil!=err {
		return err
	}
	_,_,err = client.Repositories.UpdateFile(
		client.Context,
		repoOwner, repoName,
		path,
		&github.RepositoryContentFileOptions{
			Message: stringPtr(message),
			Content: []byte(newContent),
			SHA: c.SHA,
		},)
	return err
}