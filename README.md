# The Electric Book Manager

This is work in progress. The Electric Book Manager is a web-based interface for managing books created with the [Electric Book template](http://electricbookworks.github.io/electric-book/).\*

It enables non-technical publishing teams to edit book content, review contributions, and output PDF, web- and epub-ready files. See the features currently in development [here](https://github.com/electricbookworks/electric-book-gui/projects/1).

> \* The EBM is designed to work with Electric Book projects. It will see any repo in your GitHub account that has a `_data/meta.yml` file, which is a key element of any Electric Book project.

# electricbook GUI tool

To run electricbook GUI tool locally, you need to do the following:

Build the `bin/electricbook` binary:

    ./build.sh

Make a copy of `./electricbook.yml` to `./electricbook-0.yml` and configure the following parameters:

    github:
      client: "-clientID from github oauth application configuration-"
      secret: "-secret from github oauth application configuration-"

Get a personal access token from GitHub (Settings > Developer Settings > [Personal access tokens](https://github.com/settings/tokens). At "Select scopes", you currently only need to select `repo`.

Place the token and your GitHub username in `~/.ebw.yml`:

    users:
        - token:
        - name:

### Restricting user access

You can limit users by setting the `allowed_users:` in the `electricbook-N.yml` configuration file. This means you can have an Electric Book Manager for only your specified users.

You must restart the electricbook service for changes to take effect: `systemctl restart electricbook`

It will restart at once, with your updated allowed users. Do this at a quiet time, possibly notifying your users in advance. There is an outside chance that you will drop someone's session while they're doing something, e.g. halfway through a save, and they will simply have to retry the action.

## Running the app

Start the local electricbook server:

    bin/electricbook -logtostderr web

You should then have the UI running on http://localhost:16101/.

Run `npm install` to install the rest of the dependencies. Generate the production-ready CSS by running

    gulp scss

If you're going to make changes to the SCSS or JS in the `src` directory, install [dtemplate](https://github.com/craigmj/dtemplate), then run `gulp watch` to watch for changes.

# ebw CLI tool

## Basic Settings

### ebw -u [alias]
Sets the user (as defined by name in config file) for this session

### ebw -config [filename]
Loads the ebw configuration from [filename]

## CLI related commands
### ebw cli users
Lists all the users configured for the CLI (based on config file)

### ebw cli user
Find out which user we are currently working as. You can force this with -u,
or ebw will find it from the current repo-owner on github of the
working directory of the currently checked out repo.

## Github related commands

### ebw github username
Displays the github username of the current user

### ebw github repos
Lists all the repos owned by the current user on github

### ebw github delete-repo [reponame]
Deletes the named repo from your github account. USE WITH EXTREME CAUTION.

## Book Related Commands

### ebw book new [name-of-book-repo]
Creates a new book with the given repo name in your github account, and checks it out into your local directory.

### ebw book contribute [name-of-user]/[name-of-repo]
Creates a copy of the given book so that you can contribute to the book (and does a clone: copies the files to the current working directory)

### ebw book clone [name-of-book-repo]
Same as 'git clone' with appropriate github settings, creating a local copy of the repo from your github account.

### ebw book pull-request [message]
Sends a pull-request on the current directory to ? origin-master?

### ebw book pull

### ebw book push

# Using friendly terminology

In the UI, we want to avoid using technical terms like commit and repo. Here's a rough guide to what we use:

| Technical term              | Non-technical term               |
|:----------------------------|:---------------------------------|
| Repo                        | Repo                             |
| Branch*                     | Version                          |
| Stuff in the working tree   | Work-in-progress                 |
| Save working tree           | Save work-in-progress            |
| Commit (verb)               | Commit changes                   |
| Commit (noun)               | Committed changes                |
| Repo at a given commit      | Snapshot                         |
| My commits                  | My committed changes             |
| Fork                        | Copy                             |
| Fork a repo                 | Edit a copy                      |
| My fork                     | My copy                          |
| User's repo                 | User's repo                      |
| Pull Request(s)             | Submission(s) for review         |
| Make Pull Request           | Submit changes for review        |
| Review a Pull Request       | Review Submission                |
| Upstream master             | The original                     |
| Update from upstream master | Get latest updates from original |

# Deployment

See `README-deploy.md`
