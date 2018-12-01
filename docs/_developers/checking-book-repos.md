---
title: Checking book repos
---

# Checking book repos

If a user's Git repo gets mixed up, you may need to resolve it manually. To do that, log into the EBM server, then at the command line:

1. `sudo su - electricbook` to switch to the `electricbook` user. Do *not* use the `root` user.

2. `cd /opt/electricbook/git_cache` to see the users' repos. (This location will be different if you've deliberately set a [different storage location](../adding-storage) for `git_cache` in your `electricbook-[n].yml` file.)

3. `cd github-user/repo-owner/repo` to enter the relevant repo. Note `github-user`, `repo-owner` and `repo` are the user's details:

   E.g. `cd arthurattwell/fireandlion/cingela` would be Arthur Attwell's copy of the Fire and Lion organisation's `cingela` repo, while `craigmj/craigmj/aikido-grading` would be craigmj's version of his own `aikido-grading` repo.

4. You can then issue regular git commands, e.g. `git status` to see what's up.

Be sure to do things as the `electricbook` user! Do not do anything as `root` or any other user.

If you do make a mistake, you can do `sudo chown -R electricbook:electricbook /opt/electricbook/git_cache` to give ownership back to `electricbook`.
