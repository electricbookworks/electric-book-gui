package www

import (
	"crypto/tls"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"mime"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"strings"
	"strconv"
	"time"
	// "net/http"

	"github.com/golang/glog"
	// "github.com/google/go-github/github"
	"gopkg.in/gomail.v2"
	git2go "gopkg.in/libgit2/git2go.v25"

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

func repoDiffFiles(c *Context) error {
	client := Client(c.W, c.R)
	if nil==client {
		return nil
	}
	repoOwner, repoName := c.Vars[`repoOwner`], c.Vars[`repoName`]
	c.D[`RepoOwner`] = repoOwner
	c.D[`RepoName`] = repoName

	r, err := c.Repo()
	if nil != err {
		return err
	}
	fromOID, toOID := c.Vars[`fromOID`], c.Vars[`toOID`]
	diffs, err := r.Git.CommitDiffs(fromOID, toOID)
	if nil!=err {
		return err
	}
	c.D[`FromOID`], c.D[`ToOID`] = fromOID, toOID
	c.D[`Diffs`] = diffs

	toTree, err := r.Git.IdToTree(toOID)
	if nil!=err {
		return err
	}
	defer toTree.Free()
	proseConfig, err := book.ReadProseTree(r.Repository, toTree, ``)
	if nil != err {
		return err
	}
	c.D[`ProseIgnoreFilter`] = proseConfig.IgnoreFilterJS()

	return c.Render(`repo_diff_file_viewer.html`, nil)
}

func repoDiffPatch(c *Context) error {
	client := Client(c.W, c.R)
	if nil==client {
		return nil
	}
	repoOwner, repoName := c.Vars[`repoOwner`], c.Vars[`repoName`]
	c.D[`RepoOwner`] = repoOwner
	c.D[`RepoName`] = repoName

	r, err := c.Repo()
	if nil != err {
		return err
	}
	fromOID, toOID := c.Vars[`fromOID`], c.Vars[`toOID`]
	index, err := strconv.ParseInt(c.Vars[`index`], 10, 64)
	if nil!=err {
		return err
	}
	patch, err := r.Git.CommitDiffsPatch(fromOID, toOID, int(index))
	if nil!=err {
		return err
	}
	defer patch.Free()
	c.D[`Patch`] = patch

	pretty, err := r.Git.CommitDiffsPretty(fromOID, toOID, int(index))
	if nil!=err {
		return err
	}
	c.D[`Pretty`] = pretty

	return c.Render(`repo_diff_patch.html`, nil)
}

func repoDiffDates(c *Context) error {
	client := Client(c.W, c.R)
	if nil==client {
		return nil
	}
	fromS, toS := c.R.FormValue(`from-date`), c.R.FormValue(`to-date`)
	from, err := util.ParseTime(fromS)
	if nil!=err {
		return err
	}
	to, err := util.ParseTime(toS)
	if nil!=err {
		return err
	}
	r, err := c.Repo()
	if nil!=err {
		return err
	}
	sc, ec, err := r.Git.CommitsBetween(from, to)
	if nil!=err {
		return err
	}

	repoOwner, repoName := c.Vars[`repoOwner`], c.Vars[`repoName`]

	glog.Infof(`Chose repos with dates %s and %s`, 
		sc.Committer().When.Format(`20060102 15:04:05`),
		ec.Committer().When.Format(`20060102 15:04:05`))

	return c.Redirect(`/repo/%s/%s/diff/%s/%s`, 
		repoOwner, repoName,
		sc.TreeId().String(), ec.TreeId().String())

}

// repoDiffDiff serves the DIFF file that is generated between the two OID's.
func repoDiffDiff(c *Context) error {
	client := Client(c.W, c.R)
	if nil==client {
		return nil
	}
	repoOwner, repoName := c.Vars[`repoOwner`], c.Vars[`repoName`]
	c.D[`RepoOwner`], c.D[`RepoName`]=repoOwner, repoName
	r, err := c.Repo()
	if nil!=err {
		return err
	}
	fromOID, toOID := c.Vars[`fromOID`], c.Vars[`toOID`]
	hunks, err := r.Git.DiffBlobs(fromOID, `from-name`, toOID, `to-name`)
	if nil!=err {
		return err
	}
	c.D[`Hunks`]=hunks
	return c.Render(`repo_diff_file_diff.html`, nil)
}

func repoDiffFileServer(c *Context) error {
	client := Client(c.W, c.R)
	if nil==client {
		return nil
	}
	repoOwner, repoName := c.Vars[`repoOwner`], c.Vars[`repoName`]
	c.D[`RepoOwner`] = repoOwner
	c.D[`RepoName`] = repoName

	r, err := c.Repo()
	if nil != err {
		return err
	}
	OIDandExt := c.Vars[`OID`]
	ext := filepath.Ext(OIDandExt)
	OID := OIDandExt[0:len(OIDandExt)-len(ext)]
	oid, err := git2go.NewOid(OID)
	if nil!=err {
		return err
	}
	mimeType := mime.TypeByExtension(ext)
	blob, err := r.Git.Repository.LookupBlob(oid)
	if nil!=err {
		return err
	}
	defer blob.Free()
	c.W.Header().Set(`Content-Type`, mimeType)
	c.W.Write(blob.Contents())
	return nil
}

func repoDiff(c *Context) error {
	client := Client(c.W, c.R)
	if nil==client {
		return nil
	}
	repoOwner, repoName := c.Vars[`repoOwner`], c.Vars[`repoName`]
	c.D[`RepoOwner`] = repoOwner
	c.D[`RepoName`] = repoName

	r, err := c.Repo()
	if nil != err {
		return err
	}

	commits, err := r.Git.ListCommits()
	if nil!=err {
		return err
	}

	var st, et time.Time
	for i, c := range commits {
		t := c.When
		if 0==i {
			st, et = t, t
		} else {
			if t.Before(st) {
				st = t
			}
			if t.After(et) {
				et = t
			}
		}
	}
	c.D[`FirstCommit`], c.D[`LastCommit`] = st, et
	c.D[`CommitSummaries`] = commits
	return c.Render(`repo_diff_viewer.html`, nil)
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
		c.FlashSuccess(`Committed!`, `Your changes have been committed (ID {{.Oid}})`, map[string]interface{}{`Oid`: oid.String()})
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
	repoFiles, err := git.ListAllRepoFiles(client, client.Username, repoOwner, repoName)
	if nil != err {
		return err
	}

	filesAndHashes, err := r.Git.FilesAndHashes()
	if nil!=err {
		return err
	}

	proseConfig, err := book.ReadProse(repoDir)
	if nil != err {
		return err
	}
	c.D[`ProseIgnoreFilter`] = proseConfig.IgnoreFilterJS()
	repoFiles = repoFiles.Filter(``, proseConfig.IgnoreFilter())
	c.D[`RepoFiles`] = repoFiles
	c.D[`FilesAndHashes`] = filesAndHashes
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

	erepo, err := git.NewRepo(client, repoOwner, repoName)
	if nil != err {
		return err
	}
	defer erepo.Free()

	if err := erepo.RevertLocalChanges(); nil != err {
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
			repoName,
			repoOwner,
			`master`,
			repo.Parent.Owner.GetLogin(),
			`master`,
		)
		if nil != err {
			return util.Error(err)
		}
	}

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

	// The repo might not have an upstream repo, so we allow for that possibility
	// in the error code
	upstreamActions, err := erepo.Git.GetUpstreamRemoteActions()
	if nil == err {
		c.D[`UpstreamActions`] = upstreamActions
	}

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
	glog.Infof("Checkout succeeded")

	next := c.P(`next`)

	glog.Infof(`Loading repo`)
	repo, err := c.Repo()
	if nil != err {
		return err
	}
	glog.Infof(`Created repo`)
	// Handle auto-processing of the repo state
	changed, err := repo.AutoProcessState()
	if nil != err {
		return err
	}
	glog.Infof(`AutoProcessState completed, next=%s`, next)
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
		glog.Infof(`Redirecting to /repo/%s/%s/details`, repoOwner, repoName)
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
		if _, err := repo.PullRequestCreate(args.Title, args.Notes); nil != err {
			return err
		}
		return c.Redirect(pathRepoDetail(repo))
	}

	// We should not have an error here since to create a PR we
	// MUST have an upstream remote...
	upstreamOwner, upstreamName, _ := repo.Git.GetUpstreamRemote()
	c.D[`UpstreamOwner`], c.D[`UpstreamName`] = upstreamOwner, upstreamName

	return c.Render(`pull_new.html`, nil)
}

// repoFileServer serves files from the current user's repos.
func repoFileServer(c *Context) error {
	client := Client(c.W, c.R)
	if nil == client {
		return nil
	}

	root, err := git.RepoDir(client.Username, ``, ``)
	if nil != err {
		return util.Error(err)
	}
	glog.Infof(`Serving %s from %s`, c.R.RequestURI, root)
	fs := http.StripPrefix(`/www/`, http.FileServer(http.Dir(root)))
	fs.ServeHTTP(c.W, c.R)
	return nil
}

func repoVersionedFileServer(c *Context) error {
	repo, err := c.Repo()
	if nil != err {
		return err
	}
	path := c.P(`path`)
	gitVersion, err := git.ParseGitFileVersion(c.P(`version`))
	if nil != err {
		return err
	}
	raw, err := repo.Git.CatFileVersion(path, gitVersion, nil)
	mimeType := mime.TypeByExtension(filepath.Ext(path))
	if nil != err {
		if !(os.IsNotExist(err) || git2go.IsErrorCode(err, git2go.ErrNotFound)) {
			return err
		}
		if strings.HasPrefix(mimeType, "image/") {
			c.W.Header().Add("Content-Type", "image/svg+xml")
			raw, err = ioutil.ReadFile(`public/img/not-found.svg`)
			if nil != err {
				http.Error(c.W, err.Error(), http.StatusNotFound)
				return nil
			}
			c.W.Write(raw)
			return nil
		}

		http.Error(c.W, err.Error(), http.StatusNotFound)
		return nil
	}
	c.W.Header().Add("Content-Type", mimeType)
	c.W.Write(raw)
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

	glog.Infof(`repoHandlers::repoMergeRemote: %s`, remote)
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
		PRNumber    int    `schema:"pr_number"`
		Description string `schema:"description"`
	}
	if err := c.Decode(&args); nil != err {
		return err
	}

	remote, branch := c.Vars[`remote`], c.Vars[`branch`]
	glog.Infof(`repoHandlers::repoMergeRemoteBranch: %s/%s PR=%`, remote, branch, args.PRNumber)

	repo, err := c.Repo()
	if nil != err {
		return err
	}

	if 0 == args.PRNumber {
		switch remote {
		case `upstream`:
			if err := repo.Git.PullUpstream(); nil != err {
				return err
			}
		case `origin`:
			if err := repo.Git.PullOrigin(); nil != err {
				return err
			}
		default:
			return fmt.Errorf(`You can't use repoMergeRemoteBranch to merge with remote %s`, remote)
		}
	} else {
		return fmt.Errorf(`You can't use repoMergeRemoteBranch to merge with a PR`)
	}
	conflicts, err := repo.Git.HasConflicts()
	if nil != err {
		return err
	}
	if conflicts {
		return c.Redirect(pathRepoConflict(repo))
	}
	return c.Redirect(pathRepoDetail(repo))
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

	d := gomail.NewDialer(host, port, config.Config.ErrorMail.Username, config.Config.ErrorMail.Password)
	if nil == d.TLSConfig {
		d.TLSConfig = &tls.Config{}
	}
	d.TLSConfig.InsecureSkipVerify = config.Config.ErrorMail.SkipVerify
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
