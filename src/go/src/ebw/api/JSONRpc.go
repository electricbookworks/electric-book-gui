package api

//go:generate golait2 -logtostderr gen -out jsonrpc/http.go -type API -in ebw/api/JSONRpc.go -tem go-connection -connectionClass Connection -connectionConstructor NewConnection
//go:generate golait2 -logtostderr gen -out jsonrpc/ws.go -type API -in ebw/api/JSONRpc.go -tem gows-connection -connectionClass Connection -connectionConstructor NewConnection
//go:generate golait2 -logtostderr gen -out ../../../../es6/APIHttp.js -type API -in ebw/api/JSONRpc.go -tem es6
//go:generate golait2 -logtostderr gen -out ../../../../es6/APIWs.js -type API -in ebw/api/JSONRpc.go -tem es6ws
//go:generate golait2 -logtostderr gen -out ../../../../ts/APIWs.ts -type API -in ebw/api/JSONRpc.go -tem typescriptWs

import (
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
func (rpc *API) CommitFile(repoOwner, repoName, path string) error {
	return git.CommitFile(rpc.Client, repoOwner, repoName, path)
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
func (rpc *API) CommitOnly(repoOwner, repoName, message string) error {
	repo, err := git.NewRepo(rpc.Client, repoOwner, repoName)
	if nil != err {
		return err
	}
	defer repo.Free()
	_, err = repo.Commit(message)
	return err
}

func (rpc *API) PrintPdfEndpoint(repoOwner, repoName, book, format string) (string, error) {
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
	}
	return print.MakeEndpoint(pr), nil
}

func (rpc *API) MergedFileCat(repoOwner, repoName, path string) (string, string, string, error) {
	repo, err := git.NewRepo(rpc.Client, repoOwner, repoName)
	if nil != err {
		return ``, ``, ``, err
	}
	defer repo.Free()

	our, err := repo.FileCat(path, git.FileOur)
	if nil != err {
		our = []byte{}
	}
	their, err := repo.FileCat(path, git.FileTheir)
	if nil != err {
		their = []byte{}
	}
	wd, err := repo.FileCat(path, git.FileWorking)
	if nil != err {
		wd = []byte{}
	}
	return string(our), string(their), string(wd), nil
}
