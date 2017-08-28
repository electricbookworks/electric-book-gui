package api

//go:generate golait2 -logtostderr gen -out jsonrpc/http.go -type API -in ebw/api/JSONRpc.go -tem go-connection -connectionClass Connection -connectionConstructor NewConnection
//go:generate golait2 -logtostderr gen -out jsonrpc/ws.go -type API -in ebw/api/JSONRpc.go -tem gows-connection -connectionClass Connection -connectionConstructor NewConnection
//go:generate golait2 -logtostderr gen -out ../../../../es6/APIHttp.js -type API -in ebw/api/JSONRpc.go -tem es6
//go:generate golait2 -logtostderr gen -out ../../../../es6/APIWs.js -type API -in ebw/api/JSONRpc.go -tem es6ws
//go:generate golait2 -logtostderr gen -out ../../../../ts/APIWs.ts -type API -in ebw/api/JSONRpc.go -tem typescriptWs

import (
	"fmt"
	"github.com/google/go-github/github"

	"ebw/git"
	"ebw/print"
)

/*====================== API METHODS FOLLOW ========================*/
// Version returns the version of the API running on the server.
func (rpc *API) Version() string {
	return "API v 0.1"
}

func (rpc *API) RenameFile(repoOwner, repoName, fromPath, toPath string) error {
	return git.FileRenameInWorkingDir(rpc.Client, repoOwner, repoName, fromPath, toPath)
}
func (rpc *API) RemoveFile(repoOwner, repoName, path string) error {
	return git.DeleteFile(rpc.Client, rpc.User, repoOwner, repoName, path)
}

// ListFiles returns a list of the files with the pathregex in the repo.
func (rpc *API) ListFiles(repoOwner, repoName, pathregex string) ([]string, error) {
	return git.ListFiles(rpc.Client, rpc.User, repoOwner, repoName, pathregex)
}

func (rpc *API) FileExists(repoOwner, repoName, path string) (bool, error) {
	return git.FileExistsInWorkingDir(rpc.Client, repoOwner, repoName, path)
}

// ListAllRepoFiles lists all the repo files that are in the repo
// in a DirectoryEntry format.
func (rpc *API) ListAllRepoFiles(repoOwner, repoName string) (git.DirectoryEntry, error) {
	return git.ListAllRepoFiles(rpc.Client, rpc.User, repoOwner, repoName)
}

// GetFile gets the contents of the file at path in the repo.
func (rpc *API) GetFile(repoOwner, repoName, path string) ([]byte, error) {
	return git.GetFile(rpc.Client, rpc.User, repoOwner, repoName, path)
}

func (rpc *API) GetFileString(repoOwner, repoName, path string) (string, error) {
	raw, err := git.GetFile(rpc.Client, rpc.User, repoOwner, repoName, path)
	return string(raw), err
}

func (rpc *API) UpdateFile(repoOwner, repoName, path, content string) error {
	return git.UpdateFile(rpc.Client, rpc.User, repoOwner, repoName, path, []byte(content))
}
func (rpc *API) StageFile(repoOwner, repoName, path string) error {
	err := git.StageFile(rpc.Client, repoOwner, repoName, path)
	if nil != err {
		return err
	}
	return nil
}

func (rpc *API) StageFileAndReturnMergingState(repoOwner, repoName, path string) (string, error) {
	repo, err := git.NewRepo(rpc.Client, repoOwner, repoName)
	if nil != err {
		return ``, err
	}
	defer repo.Free()
	err = git.StageFile(rpc.Client, repoOwner, repoName, path)
	if nil != err {
		return ``, err
	}
	state, err := repo.MergeFileResolutionState(path)
	if nil != err {
		return ``, err
	}
	return state.String(), nil
}

func (rpc *API) SaveWorkingFile(repoOwner, repoName, path, content string) error {
	return git.SaveWorkingFile(rpc.Client, repoOwner, repoName, path, []byte(content))
}

func (rpc *API) ListPullRequests(repoOwner, repoName string) ([]*github.PullRequest, error) {
	return git.ListPullRequests(rpc.Client, repoOwner, repoName)
}

func (rpc *API) PullRequestDiffList(repoOwner, repoName string, prNumber int) ([]*git.PullRequestDiff, error) {
	return git.PullRequestDiffListByNumber(rpc.Client, repoOwner, repoName, prNumber)
}

func (rpc *API) PullRequestVersions(repoOwner, repoName, remoteUrl, remoteSha, filePath string) (string, string, error) {
	return git.PullRequestVersions(rpc.Client, rpc.User, repoOwner, repoName, remoteUrl, remoteSha, filePath)
}

func (rpc *API) PullRequestUpdate(repoOwner, repoName, remoteSHA, filePath string, data string) error {
	return git.PullRequestUpdate(rpc.Client, rpc.User, repoOwner, repoName, remoteSHA, filePath, []byte(data))
}

func (rpc *API) Commit(repoOwner, repoName, message string) error {
	_, err := git.Commit(rpc.Client, repoOwner, repoName, message)
	return err
}
func (rpc *API) CommitAll(repoOwner, repoName, message, notes string) error {
	repo, err := git.NewRepo(rpc.Client, repoOwner, repoName)
	if nil != err {
		return err
	}
	defer repo.Free()
	_, err = repo.CommitAll(message, notes)
	return err
}
func (rpc *API) CommitOnly(repoOwner, repoName, message, notes string) error {
	repo, err := git.NewRepo(rpc.Client, repoOwner, repoName)
	if nil != err {
		return err
	}
	defer repo.Free()
	_, err = repo.Commit(message, notes)
	return err
}

func (rpc *API) PrintPdfEndpoint(repoOwner, repoName, book, format, fileList string) (string, error) {
	if `` == book {
		book = `book`
	}
	if `` == format {
		format = `print`
	}
	pr := &print.PrintRequest{
		Book:          book,
		RepoOwner:     repoOwner,
		RepoName:      repoName,
		Username:      rpc.Client.Username,
		Token:         rpc.Client.Token,
		PrintOrScreen: format,
		FileList:      fileList,
	}
	return print.MakeEndpoint(pr), nil
}

func (rpc *API) MergedFileCat(repoOwner, repoName, path string) (bool, string, bool, string, error) {
	retErr := func(err error) (bool, string, bool, string, error) {
		return false, ``, false, ``, err
	}
	repo, err := git.NewRepo(rpc.Client, repoOwner, repoName)
	if nil != err {
		return retErr(err)
	}
	defer repo.Free()

	working, their := []byte{}, []byte{}
	workingTree, theirTree := repo.WorkingTree(), repo.TheirTree()

	workingExists, err := workingTree.Exists(path)
	if nil != err {
		return retErr(err)
	}
	if workingExists {
		working, err = workingTree.Read(path)
		if nil != err {
			return retErr(err)
		}
	}
	theirExists, err := theirTree.Exists(path)
	if nil != err {
		return retErr(err)
	}
	if theirExists {
		their, err = theirTree.Read(path)
		if nil != err {
			return retErr(err)
		}
	}
	return workingExists, string(working), theirExists, string(their), nil
}

// MergedFileGit returns the git merged version of the file
func (rpc *API) MergedFileGit(repoOwner, repoName, path string) (bool, string, error) {
	repo, err := git.NewRepo(rpc.Client, repoOwner, repoName)
	if nil != err {
		return false, ``, err
	}
	defer repo.Free()

	//func (r *Repo) FileCat(path string, version FileVersion) (bool, []byte, error)
	mergeable, raw, err := repo.FileGit(path)
	if nil != err {
		return false, ``, err
	}
	return mergeable, string(raw), nil
}

// SaveMergingFile saves the 'Working' and 'Their' versions of the working
// file into our repo and our their-tree.
func (rpc *API) SaveMergingFile(repoOwner, repoName string, path string, workingExists bool, workingContent string, theirExists bool, theirContent string) (string, error) {
	r, err := git.NewRepo(rpc.Client, repoOwner, repoName)
	if nil != err {
		return ``, err
	}
	defer r.Free()
	if workingExists {
		if err := r.WorkingTree().Write(path, []byte(workingContent)); nil != err {
			return ``, err
		}
	} else {
		if err := r.WorkingTree().Remove(path); nil != err {
			return ``, err
		}
	}
	if theirExists {
		if err := r.TheirTree().Write(path, []byte(theirContent)); nil != err {
			return ``, err
		}
	} else {
		if err := r.TheirTree().Remove(path); nil != err {
			return ``, err
		}
	}
	state, err := r.MergeFileResolutionState(path)
	if nil != err {
		return ``, err
	}
	return state.String(), nil
}

// MergeFileOriginal returns the original file for the merge-version from the
// named repo.
func (rpc *API) MergeFileOriginal(repoOwner, repoName, path string, version string) (bool, string, error) {
	var v git.FileVersion
	switch version {
	case "our":
		v = git.FileOur
	case "their":
		v = git.FileTheir
	default:
		return false, ``, fmt.Errorf(`Unrecognized version request: %s`, version)
	}

	r, err := git.NewRepo(rpc.Client, repoOwner, repoName)
	if nil != err {
		return false, ``, err
	}
	defer r.Free()
	exists, raw, err := r.FileCat(path, v)
	if nil != err {
		return false, ``, err
	}
	return exists, string(raw), nil
}

func (rpc *API) FindFileLists(repoOwner, repoName string) ([]string, error) {
	r, err := git.NewRepo(rpc.Client, repoOwner, repoName)
	if nil != err {
		return nil, err
	}
	defer r.Free()
	files, err := print.FindFileLists(r.RepoPath())
	if nil != err {
		return nil, err
	}
	return files, err
}
