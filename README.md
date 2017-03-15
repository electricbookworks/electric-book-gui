# electric-book-gui
A web-based interface for managing the Electric Book workflow

# ebw CLI tool

## Basic Settings

### ebw -u [alias]
Sets the user (as defined by name in config file) for this session

### ebw -config [filename]
Loads the ebw configuration from [filename]

## CLI related commands
### ebw cli users
Lists all the users configured for the CLI (based on config file)

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


