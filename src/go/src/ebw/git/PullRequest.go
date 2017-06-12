package git

import (
	"github.com/google/go-github/github"
)

type PullRequest struct {
	*github.PullRequest
}
