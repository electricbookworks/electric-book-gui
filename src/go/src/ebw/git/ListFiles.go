package git

import (
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	// "strings"

	"github.com/golang/glog"
	"github.com/google/go-github/github"

	"ebw/util"
)

var _ = glog.Infof

// GitNotExistError returns true if the given error occurred
// because the specified path did not exist
func GitNotExistError(err error) bool {
	if nil == err {
		return false
	}
	return strings.Contains(err.Error(), `404 Not Found`)
}

// GetFile returns the contents of the file at path in users given repo
func GetFile(client *Client, user, repo, path string) ([]byte, error) {
	if false {
		fileContent, _, _, err := client.Repositories.GetContents(client.Context, user, repo, path,
			&github.RepositoryContentGetOptions{})
		if nil != err {
			return nil, util.Error(err)
		}
		content, err := fileContent.GetContent()
		if nil != err {
			return nil, util.Error(err)
		}
		return []byte(content), nil
	} else {
		root, err := RepoDir(user, repo)
		if nil != err {
			return nil, err
		}
		raw, err := ioutil.ReadFile(filepath.Join(root, path))
		if nil != err {
			return nil, err
		}
		return raw, err
	}
}

func GetFileSHA(client *Client, user, repo, path string) (*string, error) {
	if false {
		fileContent, _, _, err := client.Repositories.GetContents(client.Context, user, repo, path,
			&github.RepositoryContentGetOptions{})
		if nil != err {
			return nil, util.Error(err)
		}

		if nil == fileContent.SHA {
			return nil, fmt.Errorf("No SHA on existing file")
		}
		return fileContent.SHA, nil
	} else {
		root, err := RepoDir(user, repo)
		if nil != err {
			return nil, err
		}
		return util.CalcFileSHA(filepath.Join(root, path))
	}
}

func CreateFile(client *Client, user, repo, path string, content []byte) error {
	if false {
		message := `automatic message`
		_, _, err := client.Repositories.CreateFile(client.Context,
			user, repo, path, &github.RepositoryContentFileOptions{
				Content: content,
				Message: &message,
				SHA:     util.CalcSHA(content),
			})
		if nil != err {
			return util.Error(err)
		}
		return nil
	} else {
		root, err := RepoDir(user, repo)
		if nil != err {
			return err
		}
		if err := ioutil.WriteFile(filepath.Join(root, path), content, 0644); nil != err {
			return err
		}
		return runGitDir(root, []string{`add`,
			path,
			`-m`,
			fmt.Sprintf(`added %s`, path)})
	}
}

func DeleteFile(client *Client, user, repo, path string) error {
	if false {
		sha, err := GetFileSHA(client, user, repo, path)
		if GitNotExistError(err) {
			// If the file doesn't exist, it's pre-deleted
			return nil
		}
		if nil != err {
			return err
		}
		message := `automatic message`
		_, _, err = client.Repositories.DeleteFile(client.Context, user, repo, path,
			&github.RepositoryContentFileOptions{
				Message: &message,
				SHA:     sha,
			})
		if nil != err {
			return util.Error(err)
		}
		return nil
	} else {
		root, err := RepoDir(user, repo)
		if nil != err {
			return err
		}
		filename := filepath.Join(root, path)
		exists, err := util.FileExists(filename)
		if nil != err {
			return err
		}
		if !exists {
			return nil // doesn't exist => already deleted!
		}
		if err := runGitDir(root, []string{`rm`, path}); nil != err {
			return err
		}
		return nil
	}
}

// UpdateFile updates the given file with the given content, and adds it to the
// git staging area, ready for the next commit.
func UpdateFile(client *Client, user, repo, path string, content []byte) error {
	if false {
		glog.Infof("UpdateFile(%s)", path)
		sha, err := GetFileSHA(client, user, repo, path)

		if nil != err {
			if GitNotExistError(err) {
				glog.Infof(`UpdateFile %s does not exist: creating`, path)
				return CreateFile(client, user, repo, path, content)
			}
			return util.Error(err)
		}
		message := `automatic message`
		_, _, err = client.Repositories.UpdateFile(client.Context, user, repo, path,
			&github.RepositoryContentFileOptions{
				Content: content,
				SHA:     sha,
				Message: &message,
			})

		if nil != err {
			return util.Error(err)
		}
		return nil
	} else {
		root, err := RepoDir(user, repo)
		if nil != err {
			return err
		}
		if err := ioutil.WriteFile(filepath.Join(root, path), content, 0644); nil != err {
			return util.Error(err)
		}
		if err := runGitDir(root, []string{`add`, path}); nil != err {
			return util.Error(err)
		}
		return nil
	}
}

func ListAllRepoFiles(client *Client, user, repo string) (DirectoryEntry, error) {
	root, err := RepoDir(user, repo)
	if nil != err {
		return nil, err
	}
	d, err := NewDirectory(root)
	if nil != err {
		return nil, err
	}
	return d, nil
}

// ListFiles returns an array of all the files in the repo that match
// the pathRegexp regular expression.
func ListFiles(client *Client, user, repo, pathRegexp string) ([]string, error) {
	files := []string{}
	root, err := RepoDir(user, repo)
	if nil != err {
		return nil, err
	}
	reg, err := regexp.Compile(pathRegexp)
	if nil != err {
		return nil, err
	}

	err = filepath.Walk(root, func(fn string, fi os.FileInfo, err error) error {
		rfn, err := filepath.Rel(root, fn)
		if nil != err {
			return err
		}
		if nil != err {
			return err
		}
		if reg.MatchString(rfn) {
			files = append(files, rfn)
		}
		return nil
	})
	return files, err
}
