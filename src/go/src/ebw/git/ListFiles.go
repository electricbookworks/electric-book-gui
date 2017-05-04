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
	git2go "gopkg.in/libgit2/git2go.v25"

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
func GetFile(client *Client, user, repoOwner, repoName, path string) ([]byte, error) {
	if false {
		fileContent, _, _, err := client.Repositories.GetContents(client.Context, repoOwner, repoName, path,
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
		root, err := RepoDir(user, repoOwner, repoName)
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

func GetFileSHA(client *Client, user, repoOwner, repoName, path string) (*string, error) {
	if false {
		fileContent, _, _, err := client.Repositories.GetContents(client.Context, repoOwner, repoName, path,
			&github.RepositoryContentGetOptions{})
		if nil != err {
			return nil, util.Error(err)
		}

		if nil == fileContent.SHA {
			return nil, fmt.Errorf("No SHA on existing file")
		}
		return fileContent.SHA, nil
	} else {
		root, err := RepoDir(user, repoOwner, repoName)
		if nil != err {
			return nil, err
		}
		return util.CalcFileSHA(filepath.Join(root, path))
	}
}

func CreateFile(client *Client, user, repoOwner, repoName, path string, content []byte) error {
	if false {
		message := `automatic message`
		_, _, err := client.Repositories.CreateFile(client.Context,
			repoOwner, repoName, path, &github.RepositoryContentFileOptions{
				Content: content,
				Message: &message,
				SHA:     util.CalcSHA(content),
			})
		if nil != err {
			return util.Error(err)
		}
		return nil
	} else {
		root, err := RepoDir(user, repoOwner, repoName)
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

func DeleteFile(client *Client, user, repoOwner, repoName, path string) error {
	if false {
		sha, err := GetFileSHA(client, user, repoOwner, repoName, path)
		if GitNotExistError(err) {
			// If the file doesn't exist, it's pre-deleted
			return nil
		}
		if nil != err {
			return err
		}
		message := `automatic message`
		_, _, err = client.Repositories.DeleteFile(client.Context, repoOwner, repoName, path,
			&github.RepositoryContentFileOptions{
				Message: &message,
				SHA:     sha,
			})
		if nil != err {
			return util.Error(err)
		}
		return nil
	} else {
		root, err := RepoDir(user, repoOwner, repoName)
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

// UpdateFile updates the given file with the given
// content,
// and adds it to the
// git staging area, ready for the next commit.
func UpdateFile(client *Client, user, repoOwner, repoName, path string, content []byte) error {
	repoDir, err := RepoDir(user, repoOwner, repoName)
	if nil != err {
		return err
	}
	if err := ioutil.WriteFile(filepath.Join(repoDir, path), content, 0644); nil != err {
		return util.Error(err)
	}
	repo, err := git2go.OpenRepository(repoDir)
	if nil != err {
		return util.Error(err)
	}
	defer repo.Free()

	index, err := repo.Index()
	if nil != err {
		return util.Error(err)
	}
	defer index.Free()
	if err := index.AddByPath(path); nil != err {
		return util.Error(err)
	}
	if err := index.Write(); nil != err {
		return util.Error(err)
	}
	glog.Infof(`AddByPath appears to have worked`)

	// if err := runGitDir(root, []string{`add`, path}); nil != err {
	// 	return util.Error(err)
	// }
	return nil
}

// ListAllRepoFiles returns a Directory type with all the files in
// the repo.
func ListAllRepoFiles(client *Client, user, repoOwner, repoName string) (DirectoryEntry, error) {
	root, err := RepoDir(user, repoOwner, repoName)
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
func ListFiles(client *Client, user, repoOwner, repoName, pathRegexp string) ([]string, error) {
	files := []string{}
	root, err := RepoDir(user, repoOwner, repoName)
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

func FileExistsInWorkingDir(client *Client, repoOwner, repoName, path string) (bool, error) {
	repoDir, err := RepoDir(client.Username, repoOwner, repoName)
	if nil != err {
		return false, err
	}
	_, err = os.Stat(filepath.Join(repoDir, path))
	if nil == err {
		return true, nil
	}
	if os.IsNotExist(err) {
		return false, nil
	}
	return false, util.Error(err)
}

func FileRenameInWorkingDir(client *Client, repoOwner, repoName, fromPath, toPath string) error {
	if fromPath==toPath {
		return nil
	}
	repoDir, err := RepoDir(client.Username, repoOwner, repoName)
	if nil != err {
		return err
	}
	from := filepath.Join(repoDir, fromPath)
	to := filepath.Join(repoDir, toPath)
	// TODO: Should check that both from and to remain
	// without our repoDir...
	exists, err := util.FileExists(to)
	if nil != err {
		return err
	}
	if exists {
		return fmt.Errorf(`Destination file %s already exists`, toPath)
	}
	exists, err = util.FileExists(from)
	if nil != err {
		return err
	}
	if !exists {
		return fmt.Errorf(`Source file %s does not exist`, fromPath)
	}
	}
	if err := runGitDir(repoDir, []string{`mv`, from, to}); nil != err {
		glog.Errorf(`ERROR running git mv %s %s: %`, from, to, err.Error())
		return err
	}
	return nil
}
