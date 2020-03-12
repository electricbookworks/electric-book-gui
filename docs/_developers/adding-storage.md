---
title: Adding storage
description: "If your EBM handles many and/or large repos, you may need to move storage from the default location to separate storage."
---

# Adding storage to an EBM
{:.no_toc}

* TOC here
{:toc}

If your EBM handles many and/or large repos, you may need to move storage from the default location (in `/opt/electricbook/git_cache` on the same machine as your `electricbook` binary) to separate storage.

## Quick overview

In short, you need to:

1. Stop the `electricbook` service.
2. Copy any existing repos to your new storage location.
3. Change the `git_cache` value in your `electricbook-[n].yml ` file to the path to your new storage location.
4. Restart the `electricbook` service.

You'll understand what these steps entail more clearly if you read the example below.

## An example using Digital Ocean

This is a description of how you'd move repos on an EBM to Digital Ocean block storage.

### 1. Add a volume

[This guide](https://www.digitalocean.com/community/tutorials/how-to-use-block-storage-on-digitalocean) explains how to:

1. Attach a new block-storage volume.
2. Prepare the new volume.
3. Test that the new volume is working.

(You might not even need the guide, because on Digital Ocean the process for adding a new volume is clearly explained as soon as you attach a new volume to your droplet from its 'Volumes' tab.)

Once your new volume is up and running, make a note of its location. For instance, by default your first storage volume in the London datacentre will be mounted at `/mnt/volume-lon1-01`.

### 2. Stop the `electricbook`

If you might have users working on the projects while you do this, let them know the EBM will be down for maintenance and then stop the `electricbook` service:

```
systemctl stop electricbook
```

### 3. Migrate existing repos

On your droplet, copy `git_cache` to your new volume. For instance, you might create an `electricbook` directory on it:

```
mkdir /mnt/volume-lon1-01/electricbook
```

and use rsync to copy everything to there:

```
rsync -avz /opt/electricbook/git_cache /mnt/volume-lon1-01/electricbook
```

Don't delete the contents of your old `/opt/electricbook/git_cache` until you're certain that the new storage location is working.

### 4. Update your EBM's storage location config

In `/opt/electricbook` you will have created an `electricbook-n.yml` config file (where `n` is a number like `0` or `1`). Let's say yours is `electricbook-0.yml`.

Open `electricbook-0.yml` for editing (e.g. use `nano electricbook-0.yml` to edit it in the terminal), and change:

```
git_cache: "git_cache"
```

to

```
git_cache: "/mnt/volume-lon1-01/electricbook/git_cache"
```

Note: Don't make config changes to `electricbook.yml`. This config file is checked into the template repo, and is the example config file. Your EBM's config goes in `electricbook-0.yml`, which overrides any settings in `electricbook.yml`, and is ignored by git, so that settings, keys, etc. don't get accidentally checked into version control. (The values in `electricbook.yml` are actually set from the ansible script on setup.)

### 5. Check or fix permissions

The `git_cache` directory needs to be owned by the `electricbook` user. If you didn't create it this way, fix it from the command line:

```
sudo chown -R electricbook:electricbook [cache-directory]
```

where [cache-directory] is the directory you've configured as the cache. E.g.

```
sudo chown -R electricbook:electricbook /mnt/volume-lon1-01/electricbook/git_cache
```

### 6. Start the `electricbook` service

Restart the `electricbook` service:

```
systemctl start electricbook
```

### 7. Test that storage is working

One way to test is to use the EBM to create a new file in a project, and then check from the server terminal whether that file exists in the new storage location.

### 8. Delete the old `git_cache`

Only once you're sure that the block storage is working should you delete the contents of your old `git_cache` directory (`/opt/electricbook/git_cache` by default):

```
rm -rf /opt/electricbook/git_cache/*
```
