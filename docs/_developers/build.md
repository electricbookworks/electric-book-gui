---
title: Build and run locally
description: "How to build and run the EBM app locally."
---

# Build and run locally
{:.no_toc}

* TOC here
{:toc}

## Build the app

Once you're all set up, to build and run the app you will simply run:

    make all
^
    make run

Here are more detailed instructions for first-time setup:

1. Make a copy of `./electricbook.yml` to `./electricbook-0.yml` and configure the parameters as needed. You must set the Client ID and Client Secret of your own [GitHub OAuth application](https://github.com/settings/developers):

   ```
   github:
     client: "-clientID from github oauth application configuration-"
     secret: "-secret from github oauth application configuration-"
   ```

   Do not commit this file to version control.

1. Get a personal access token from GitHub (Settings > Developer Settings > [Personal access tokens](https://github.com/settings/tokens). At "Select scopes", you currently only need to select `repo`.

   Place the token and your GitHub username in `~/.ebw.yml`:

   ```
   users:
     - token:
     - name:
   ```

1. Run `npm install` to install the rest of the dependencies. Generate the production-ready CSS by running:

       gulp scss

   If you're going to make changes to the SCSS or JS in the `src` directory, install [DTemplate](https://github.com/craigmj/dtemplate), then run `gulp watch` to watch for changes.

1. To build, enter in the Terminal:

       make all

   This will create two binaries in `bin`: `electricbook`, which is the EBM web app, and `ebw`, which is a CLI app.

1. Start the app with:

       make run

   (This make command simply does `bin/electricbook -logtostderr web`.)

   This must be run from the repo directory, since it needs access to the `public` directory, to some other directories it will create on the fly, and to the `electricbook.yml` configuration file.

   You can then open the EBM in your browser at [http://localhost:16101/](http://localhost:16101/).

1. Alternatively, run `make dev` to start the app and watch the Sass, Typescript and dTemplates all at once.
