---
title: Build and run locally
---

# Build and run locally

Once you're all set up, to build and run the app you will simply run:

    ./build.sh
^
    bin/electricbook -logtostderr web      

Here are more detailed instructions.

1. To build, run:

       ./build.sh

   This will create a binary in `bin/electricbookworks`.

2. Make a copy of `./electricbook.yml` to `./electricbook-0.yml` and configure the following parameters:

   ```
   github:
     client: "-clientID from github oauth application configuration-"
     secret: "-secret from github oauth application configuration-"
   ```

3. Get a personal access token from GitHub (Settings > Developer Settings > [Personal access tokens](https://github.com/settings/tokens). At "Select scopes", you currently only need to select `repo`.

   Place the token and your GitHub username in `~/.ebw.yml`:

   ```
   users:
     - token:
     - name:
   ```

4. Run `npm install` to install the rest of the dependencies. Generate the production-ready CSS by running:

       gulp scss

   If you're going to make changes to the SCSS or JS in the `src` directory, install [DTemplate](https://github.com/craigmj/dtemplate), then run `gulp watch` to watch for changes.

5. Start the app with:

       bin/electricbookworks -logtostderr web

   This must be run from the repo directory, since it needs access to the `public` directory, to some other directories it will create on the fly, and to the `electricbook.yml` configuration file.

   You should then have the UI running on [http://localhost:16101/](http://localhost:16101/).
