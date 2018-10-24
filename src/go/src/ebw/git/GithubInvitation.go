package git

import (
	// "github.com/golang/glog"
	"github.com/google/go-github/github"
	// git2go "gopkg.in/libgit2/git2go.v25"

	"ebw/util"
)

type GithubInvitation struct {
	*github.RepositoryInvitation
}

// UserInvitations returns a slice of all the open invitations for the current user.
func (c *Client) UserInvitations() ([]*GithubInvitation, error) {
	// return []*GithubInvitation{}, nil
	invites := []*GithubInvitation{}
	listOptions := github.ListOptions{}
	if err := GithubPaginate(&listOptions, func() (*github.Response, error) {
		ri, res, err := c.Client.Users.ListInvitations(c.Context) //, &listOptions)
		if nil != err {
			return nil, util.Error(err)
		}
		for _, i := range ri {
			invites = append(invites, &GithubInvitation{i})
		}
		return res, nil
	}); nil != err {
		return nil, util.Error(err)
	}
	return invites, nil
}

// GithubInvitationAccept accepts or declines the invitation with the given ID.
func (c *Client) GithubInvitationAccept(id int, accept bool) error {
	var err error
	if accept {
		_, err = c.Client.Users.AcceptInvitation(c.Context, id)
	} else {
		_, err = c.Client.Users.DeclineInvitation(c.Context, id)
	}
	if nil != err {
		return util.Error(err)
	}
	return nil
}
