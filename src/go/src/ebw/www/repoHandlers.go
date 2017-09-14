package www

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	// "net/http"

	"github.com/golang/glog"
	// "github.com/google/go-github/github"
	"gopkg.in/gomail.v2"

	"ebw/book"
	"ebw/config"
	"ebw/git"
	"ebw/util"
)

func repoFileViewer(c *Context) error {
	client := Client(c.W, c.R)
	if nil == client {
		return nil
	}
	repoOwner := c.Vars[`repoOwner`]
	repoName := c.Vars[`repoName`]
	c.D[`RepoOwner`] = repoOwner
	c.D[`RepoName`] = repoName
	return c.Render(`repo_file_viewer.html`, nil)
}

func repoCommit(c *Context) error {
	client := Client(c.W, c.R)
	if nil == client {
		return nil
	}

	repoOwner := c.Vars[`repoOwner`]
	repoName := c.Vars[`repoName`]
	r, err := c.Repo()
	if nil != err {
		return err
	}

	if `POST` == c.R.Method {
		// Process a POST for a Commit
		msg := c.P(`commit_message`)
		if `` == msg {
			c.FlashError(`Enter a Commit Message`, `Please enter a commit message to describe the changes you're committing.`, nil)
			return c.Redirect(`/repo/%s/%s/commit`, repoOwner, repoName)
		}
		oid, err := git.Commit(client, repoOwner, repoName, msg)
		if nil != err {
			return err
		}
		c.FlashSuccess(`Commit Succeeded`, `Your commit succeeded with ID {{.Oid}}`, map[string]interface{}{`Oid`: oid.String()})
		return c.Redirect(pathRepoDetail(r))
	}

	c.D[`UserName`] = client.Username
	c.D[`RepoOwner`] = repoOwner
	c.D[`RepoName`] = repoName
	c.D[`Path`] = r.RepoPath()

	statusList, err := git.GitStatusList(c.Context(), r.RepoPath())
	if nil != err {
		return err
	}
	c.D[`StatusList`] = statusList

	return c.Render(`repo_commit.html`, nil)
}

func repoList(c *Context) error {
	client := Client(c.W, c.R)
	if nil == client {
		return nil
	}

	repos, err := git.FetchRepos(client, int(c.PI(`pg`)), int(c.PI(`pp`)))
	if nil != err {
		return err
	}

	invites, err := client.UserInvitations()
	if nil != err {
		return err
	}

	return c.Render("repo_list.html", map[string]interface{}{
		"Repos":    repos,
		"UserName": client.Username,
		"Invites":  invites,
	})
}

func repoView(c *Context) error {
	var err error
	client := Client(c.W, c.R)
	if nil == client {
		// GithubClient will have redirected us
		return nil
	}

	repoOwner := c.Vars[`repoOwner`]
	repoName := c.Vars[`repoName`]

	c.D[`UserName`] = client.Username
	c.D[`RepoOwner`] = repoOwner
	c.D[`RepoName`] = repoName

	r, err := c.Repo()
	if nil != err {
		return err
	}
	repoDir := r.RepoPath()
	c.D[`Path`] = repoDir
	c.D[`RepoFiles`], err = git.ListAllRepoFiles(client, client.Username, repoOwner, repoName)
	if nil != err {
		return err
	}

	proseConfig, err := book.ReadProse(repoDir)
	if nil != err {
		return err
	}
	c.D[`ProseIgnoreFilter`] = proseConfig.IgnoreFilterJS()

	return c.Render(`repo_view.html`, nil)
}

func repoDetails(c *Context) error {
	client := Client(c.W, c.R)
	if nil == client {
		return nil
	}
	repoOwner := c.Vars[`repoOwner`]
	repoName := c.Vars[`repoName`]

	repo, _, err := client.Repositories.Get(c.Context(), repoOwner, repoName)
	if nil != err {
		return err
	}

	prs, err := git.ListPullRequests(client, repoOwner, repoName)
	if nil != err {
		return err
	}
	c.D[`PullRequests`] = prs
	c.D[`PrCount`] = len(prs)

	var aheadBehind *git.RepoDiffStats

	if nil != repo.Parent {
		aheadBehind, err = git.CompareCommits(client,
			repo.GetName(),
			repo.Owner.GetLogin(),
			`master`,
			repo.Parent.Owner.GetLogin(),
			`master`,
		)
		if nil != err {
			return util.Error(err)
		}
	}

	erepo, err := git.NewRepo(client, repoOwner, repoName)
	if nil != err {
		return err
	}
	defer erepo.Free()

	stagedFiles, err := erepo.StagedFiles()
	if nil != err {
		return err
	}

	c.D[`ERepo`] = erepo
	c.D[`StagedFiles`] = stagedFiles

	c.D[`AheadBehind`] = aheadBehind

	c.D[`UserName`] = client.Username
	c.D[`RepoOwner`] = repoOwner
	c.D[`RepoName`] = repoName

	c.D[`RepoFiles`], err = git.ListAllRepoFiles(client, client.Username, repoOwner, repoName)
	if nil != err {
		return err
	}

	return c.Render(`repo_detail.html`, map[string]interface{}{
		"Repo": repo,
	})
}

func repoUpdate(c *Context) error {
	client := Client(c.W, c.R)
	if nil == client {
		return nil
	}
	repoOwner := c.Vars[`repoOwner`]
	repoName := c.Vars[`repoName`]

	repoUrl := c.P(`url`)
	if _, err := git.Checkout(client, repoOwner, repoName, repoUrl); nil != err {
		return err
	}

	next := c.P(`next`)

	repo, err := c.Repo()
	if nil != err {
		return err
	}
	// Handle auto-processing of the repo state
	changed, err := repo.AutoProcessState()
	if nil != err {
		return err
	}
	if changed {
		return c.Redirect(`/repo/%s/%s/update?next=%s`, repoOwner, repoName, url.QueryEscape(next))
	}

	switch next {
	case `conflict`:
		return c.Redirect(pathRepoConflict(repo))
	case `edit`:
		return c.Redirect(`/repo/%s/%s/`, repoOwner, repoName)
	case `detail`:
	case ``:
		return c.Redirect(`/repo/%s/%s/detail`, repoOwner, repoName)
	default:
		return c.Redirect(next)
	}

	return c.Redirect(`/repo/%s/%s/detail`, repoOwner, repoName)
}

func pullRequestClose(c *Context) error {
	client := Client(c.W, c.R)
	if nil == client {
		return nil
	}
	repoOwner := c.Vars[`repoOwner`]
	repoName := c.Vars[`repoName`]

	number := int(c.PI(`number`))
	if err := git.PullRequestClose(client, repoOwner, repoName, number); nil != err {
		return err
	}
	return c.Redirect(`/repo/%s/%s/detail`, repoOwner, repoName)
}

// pullRequestMerge merges a pull request and sends the user to the
// conflict page.
func pullRequestMerge(c *Context) error {
	repo, err := c.Repo()
	if nil != err {
		return err
	}
	prNumber := int(c.PI(`number`))
	if err := repo.PullPR(prNumber); nil != err {
		return err
	}
	return c.Redirect(pathRepoConflict(repo))
}

func pullRequestCreate(c *Context) error {
	repo, err := c.Repo()
	if nil != err {
		return err
	}

	c.D[`UserName`] = repo.Client.Username
	c.D[`RepoOwner`] = repo.RepoOwner
	c.D[`RepoName`] = repo.RepoName

	if `POST` == c.R.Method {
		var args struct {
			Title string `schema:"title"`
			Notes string `schema:"notes"`
		}
		if err := c.Decode(&args); nil != err {
			return err
		}
		if err := repo.PullRequestCreate(args.Title, args.Notes); nil != err {
			return err
		}
		return c.Redirect(pathRepoDetail(repo))
	}

	return c.Render(`pull_new.html`, nil)
}

// repoFileServer serves files from the current user's repos.
func repoFileServer(c *Context) error {
	client := Client(c.W, c.R)
	if nil == client {
		return nil
	}

	root, err := os.Getwd()
	if nil != err {
		return util.Error(err)
	}
	root = filepath.Join(root, config.Config.GitCache, `repos`, client.Username)
	glog.Infof(`Serving %s from %s`, c.R.RequestURI, root)
	fs := http.StripPrefix(`/www/`, http.FileServer(http.Dir(root)))
	fs.ServeHTTP(c.W, c.R)
	return nil
}

// repoPushRemote pushes to the remote repo. For our purposes
// this would almost always be origin/master
func repoPushRemote(c *Context) error {
	repo, err := c.Repo()
	if nil != err {
		return err
	}
	if err := repo.Push(c.Vars[`remote`], c.Vars[`branch`]); nil != err {
		return err
	}
	return c.Redirect(pathRepoDetail(repo))
}

// repoMergeRemote only handles merging with upstream or origin / master
// branch.
func repoMergeRemote(c *Context) error {
	remote := c.Vars[`remote`]
	repo, err := c.Repo()
	if nil != err {
		return err
	}
	switch remote {
	case `upstream`:
		if err := repo.PullUpstream(); nil != err {
			return err
		}
	case `origin`:
		if err := repo.PullOrigin(); nil != err {
			return err
		}
	default:
		return fmt.Errorf(`Cannot call repoMergeRemote with remote %s`, remote)
	}
	return c.Redirect(pathRepoDetail(repo))
}

func repoMergeRemoteBranch(c *Context) error {
	var args struct {
		Resolve     string `schema:"resolve"`
		Conflicted  bool   `schema:"conflicted"`
		PRNumber    int    `schema:"pr_number"`
		Description string `schema:"description"`
	}
	if err := c.Decode(&args); nil != err {
		return err
	}

	var resolve git.ResolveMergeOption
	switch args.Resolve {
	case `our`:
		resolve = git.ResolveMergeOur
	case `their`:
		resolve = git.ResolveMergeTheir
	case `git`:
		fallthrough
	default:
		return fmt.Errorf(`Only supported resolve param values are 'their' and 'our'`)
	}

	remote, branch := c.Vars[`remote`], c.Vars[`branch`]
	repo, err := c.Repo()
	if nil != err {
		return err
	}

	if `` == args.Description {
		if 0 < args.PRNumber {
			args.Description = fmt.Sprintf(`You are merging Pull Request number %d.`, args.PRNumber)
		} else {
			if `upstream` == remote {
				args.Description = `You are merging with the original project you are contributing to.`
			} else {
				args.Description = `You are merging with your GitHub repo.`
			}
		}
	}
	if err := repo.MergeWith(remote, branch, resolve, args.Conflicted, args.PRNumber, args.Description); nil != err {
		return err
	}
	return c.Redirect(pathRepoConflict(repo))
}

func githubInvitationAcceptOrDecline(c *Context) error {
	client := Client(c.W, c.R)
	if nil == client {
		// GithubClient will redirect us
		return nil
	}
	accept := `yes` == c.P(`accept`)
	if err := client.GithubInvitationAccept(int(c.PI(`id`)), accept); nil != err {
		return err
	}

	if accept {
		c.FlashSuccess(`Invitation Accepted`, `You have accepted the invitation.`, nil)
	} else {
		c.FlashSuccess(`Invitation Declined`, `You have declined the invitation.`, nil)
	}

	return c.Redirect(`/`)
}

func errorReporter(c *Context) error {
	var args struct {
		When        string `schema:"when"`
		User        string `schema:"user"`
		Error       string `schema:"error"`
		Description string `schema:"description"`
	}
	if err := c.Decode(&args); nil != err {
		return err
	}
	// LOG the error to an email address
	raw, _ := json.Marshal(&args)
	to, from := config.Config.ErrorMail.FromTo()
	host, port := config.Config.ErrorMail.HostPort()

	m := gomail.NewMessage()
	m.SetHeader("From", from)
	m.SetHeader("To", to)
	m.SetHeader("Subject", `Error report: `, args.Error)
	m.SetBody("text/plain", string(raw))

	d := gomail.Dialer{Host: host, Port: port}
	if err := d.DialAndSend(m); err != nil {
		glog.Error(err)
		return err
	}

	return c.Render(`error_report_sent.html`, nil)
}

func repoStatus(c *Context) error {
	repo, err := c.Repo()
	if nil != err {
		return err
	}
	c.D[`RepoStatus`] = repo.EBWRepoStatus
	return c.Render(`repo_status.html`, nil)
}
