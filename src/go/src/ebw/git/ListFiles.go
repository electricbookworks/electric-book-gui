package git

import (
	"crypto/sha1"
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
func GetFile(client *github.Client, user, repo, path string) ([]byte, error) {
	if true {
		fileContent, _, _, err := client.Repositories.GetContents(user, repo, path,
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

func GetFileSHA(client *github.Client, user, repo, path string) (*string, error) {
	fileContent, _, _, err := client.Repositories.GetContents(user, repo, path,
		&github.RepositoryContentGetOptions{})
	if nil != err {
		return nil, util.Error(err)
	}

	if nil == fileContent.SHA {
		return nil, fmt.Errorf("No SHA on existing file")
	}
	return fileContent.SHA, nil
}

func calcSHA(in []byte) *string {
	// The pattern for generating a hash is `sha1.New()`,
	// `sha1.Write(bytes)`, then `sha1.Sum([]byte{})`.
	// Here we start with a new hash.
	h := sha1.New()

	// `Write` expects bytes. If you have a string `s`,
	// use `[]byte(s)` to coerce it to bytes.
	h.Write(in)

	// This gets the finalized hash result as a byte
	// slice. The argument to `Sum` can be used to append
	// to an existing byte slice: it usually isn't needed.
	bs := h.Sum(nil)

	s := fmt.Sprintf("%x", bs)
	return &s
}

func CreateFile(client *github.Client, user, repo, path string, content []byte) error {
	message := `automatic message`
	_, _, err := client.Repositories.CreateFile(
		user, repo, path, &github.RepositoryContentFileOptions{
			Content: content,
			Message: &message,
			SHA:     calcSHA(content),
		})
	if nil != err {
		return util.Error(err)
	}
	return nil
}

func DeleteFile(client *github.Client, user, repo, path string) error {
	sha, err := GetFileSHA(client, user, repo, path)
	if GitNotExistError(err) {
		// If the file doesn't exist, it's pre-deleted
		return nil
	}
	if nil != err {
		return err
	}
	message := `automatic message`
	_, _, err = client.Repositories.DeleteFile(user, repo, path,
		&github.RepositoryContentFileOptions{
			Message: &message,
			SHA:     sha,
		})
	if nil != err {
		return util.Error(err)
	}
	return nil
}

func UpdateFile(client *github.Client, user, repo, path string, content []byte) error {
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
	_, _, err = client.Repositories.UpdateFile(user, repo, path,
		&github.RepositoryContentFileOptions{
			Content: content,
			SHA:     sha,
			Message: &message,
		})

	if nil != err {
		return util.Error(err)
	}
	return nil
}

// ListFiles returns an array of all the files in the repo that match
// the pathRegexp regular expression.
func ListFiles(client *github.Client, user, repo, pathRegexp string) ([]string, error) {
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
