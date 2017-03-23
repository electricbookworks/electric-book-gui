# The Electric Book Manager

This is work in progress. The Electric Book Manager is a web-based interface for managing the [Electric Book workflow](http://electricbook.works/). It will enable non-technical publishing teams to edit book content, review contributions, and output PDF, web- and epub-ready files. See the features currently in development [here](https://github.com/electricbookworks/electric-book-gui/projects/1).

# electricbook GUI tool

To run electricbook GUI tool locally, you need to do the following:

Build the `bin/electricbook` binary:

    ./build.sh

Make a copy of `./electricbook.yml` to `./electricbook-0.yml` and configure the following parameters:
    
    github:
      client: "-clientID from github oauth application configuration-"
      secret: "-secret from github oauth application configuration-"

Start the local electricbook server:

    bin/electricbook -logtostderr web

You should then have the UI running on http://localhost:16101/


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


