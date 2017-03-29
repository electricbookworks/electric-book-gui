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

func (rpc *API) DeleteFile(repo, path string) error {
	return git.DeleteFile(rpc.Client, rpc.User, repo, path)
}

// ListFiles returns a list of the files with the pathregex in the repo.
func (rpc *API) ListFiles(repo, pathregex string) ([]string, error) {
	return git.ListFiles(rpc.Client, rpc.User, repo, pathregex)
}

// ListAllRepoFiles lists all the repo files that are in the repo
// in a DirectoryEntry format.
func (rpc *API) ListAllRepoFiles(repo string) (git.DirectoryEntry, error) {
	return git.ListAllRepoFiles(rpc.Client, rpc.User, repo)
}

// GetFile gets the contents of the file at path in the repo.
func (rpc *API) GetFile(repo, path string) ([]byte, error) {
	return git.GetFile(rpc.Client, rpc.User, repo, path)
}

func (rpc *API) GetFileString(repo, path string) (string, error) {
	raw, err := git.GetFile(rpc.Client, rpc.User, repo, path)
	return string(raw), err
}

func (rpc *API) UpdateFile(repo, path, content string) error {
	return git.UpdateFile(rpc.Client, rpc.User, repo, path, []byte(content))
}

func (rpc *API) ListPullRequests(repo string) ([]*github.PullRequest, error) {
	return git.ListPullRequests(rpc.Client, rpc.User, repo)
}

func (rpc *API) PullRequestDiffList(repo, sha, regexp string) ([]*git.PullRequestDiff, error) {
	return git.PullRequestDiffList(rpc.Client, rpc.User, repo, sha, regexp)
}

func (rpc *API) PullRequestVersions(repo, remoteUrl, remoteSha, filePath string) (string, string, error) {
	return git.PullRequestVersions(rpc.Client, rpc.User, repo, remoteUrl, remoteSha, filePath)
}

func (rpc *API) PullRequestUpdate(repo, remoteSHA, filePath string, data string) error {
	return git.PullRequestUpdate(rpc.Client, rpc.User, repo, remoteSHA, filePath, []byte(data))
}

func (rpc *API) Commit(repo, message string) error {
	return git.Commit(rpc.Client, rpc.User, repo, message)
}

func (rpc *API) PrintPdfEndpoint(repo, book string) (string, error) {
	if `` == book {
		book = `book`
	}
	pr := &print.PrintRequest{
		Book:     book,
		Repo:     repo,
		Username: rpc.Client.Username,
		Token:    rpc.Client.Token,
	}
	return print.MakeEndpoint(pr), nil
}
