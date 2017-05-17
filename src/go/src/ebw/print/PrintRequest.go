package print

type PrintRequest struct {
	Username  string
	RepoOwner string
	RepoName  string
	Book      string
	Token     string
	PrintOrScreen string
}
