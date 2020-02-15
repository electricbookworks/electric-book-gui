---
title: CLI
description: "The EBM project includes a CLI for certain Electric Book operations."
---

# The `ebw` CLI tool
{:.no_toc}

* TOC here
{:toc}

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