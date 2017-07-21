package print

type PrintRequest struct {
	Username      string
	RepoOwner     string
	RepoName      string
	Book          string
	Token         string
	PrintOrScreen string
	FileList      string // Directory of the file-list file
}
