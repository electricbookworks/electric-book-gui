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

Here are more detailed instructions.

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

1. Run `npm install` to install the rest of the dependencies.

1. Generate the production-ready CSS by running:

   ``` sh
   gulp scss
   ```

   If you're going to make changes to the SCSS in the `src` directory, run `gulp watch` to watch for changes.

1. If you're going to make changes to the JS in the `src` directory, install [DTemplate](https://github.com/craigmj/dtemplate), then run

   ``` sh
   dtemplate -dir src/ts -lang ts -logtostderr -out src/ts/Templates.ts -watch
   ```

   and

   ``` sh
   rollup -c --watch
   ```

   to watch for changes.

1. To build, enter in the Terminal:

   ``` sh
   make all
   ```

   This will create two binaries in `bin`: `electricbook`, which is the EBM web app, and `ebw`, which is a CLI app.

1. Start the app with:

   ``` sh
   make run
   ```

   (This make command simply does `bin/electricbook -logtostderr web`.)

   This must be run from the repo directory, since it needs access to the `public` directory, to some other directories it will create on the fly, and to the `electricbook.yml` configuration file.

   You can then open the EBM in your browser at [http://localhost:16101/](http://localhost:16101/).

For convenience, run `make dev` to start the app and watch the Sass, Typescript and dTemplates all at once. Note that this runs the processes in parallel, and you'll have to kill them manually when you're done.
