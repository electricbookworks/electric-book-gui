package api

//go:generate golait2 -logtostderr gen -out jsonrpc/http.go -type API -in ebw/api/JSONRpc.go -tem go-connection -connectionClass Connection -connectionConstructor NewConnection
//go:generate golait2 -logtostderr gen -out jsonrpc/ws.go -type API -in ebw/api/JSONRpc.go -tem gows-connection -connectionClass Connection -connectionConstructor NewConnection
//go:generate golait2 -logtostderr gen -out ../../../../es6/APIHttp.js -type API -in ebw/api/JSONRpc.go -tem es6
//go:generate golait2 -logtostderr gen -out ../../../../es6/APIWs.js -type API -in ebw/api/JSONRpc.go -tem es6ws

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

func (rpc *API) DeleteFile(repoOwner, repoName, path string) error {
	return git.DeleteFile(rpc.Client, rpc.User, repoOwner, repoName, path)
}

// ListFiles returns a list of the files with the pathregex in the repo.
func (rpc *API) ListFiles(repoOwner, repoName, pathregex string) ([]string, error) {
	return git.ListFiles(rpc.Client, rpc.User, repoOwner, repoName, pathregex)
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

func (rpc *API) ListPullRequests(repoOwner, repoName string) ([]*github.PullRequest, error) {
	return git.ListPullRequests(rpc.Client, rpc.User, repoOwner, repoName)
}

func (rpc *API) PullRequestDiffList(repoOwner, repoName, sha, regexp string) ([]*git.PullRequestDiff, error) {
	return git.PullRequestDiffList(rpc.Client, rpc.User, repoOwner, repoName, sha, regexp)
}

func (rpc *API) PullRequestVersions(repoOwner, repoName, remoteUrl, remoteSha, filePath string) (string, string, error) {
	return git.PullRequestVersions(rpc.Client, rpc.User, repoOwner, repoName, remoteUrl, remoteSha, filePath)
}

func (rpc *API) PullRequestUpdate(repoOwner, repoName, remoteSHA, filePath string, data string) error {
	return git.PullRequestUpdate(rpc.Client, rpc.User, repoOwner, repoName, remoteSHA, filePath, []byte(data))
}

func (rpc *API) Commit(repoOwner, repoName, message string) error {
	return git.Commit(rpc.Client, rpc.User, repoOwner, repoName, message)
}

func (rpc *API) PrintPdfEndpoint(repoOwner, repoName, book string) (string, error) {
	if `` == book {
		book = `book`
	}
	pr := &print.PrintRequest{
		Book:      book,
		RepoOwner: repoOwner,
		RepoName:  repoName,
		Username:  rpc.Client.Username,
		Token:     rpc.Client.Token,
	}
	return print.MakeEndpoint(pr), nil
}
