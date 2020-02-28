---
title: User access
description: "You can restrict who can log into your Electric Book Manager, for only your specified users."
---

# User access

You can restrict who can log into your EBM. This means you can have an Electric Book Manager for only your specified users.

## Summary

1. Save a plain-text list of users in `electricbook-users.txt` in your repo root. (Don't commit it.)
2. To update the list on your staging or production server, run either `make users-staging` or `make users-production`.

## Detail

The EBM checks the `allowed_users:`  list in your `electricbook-N.yml` configuration file (where `N` is a number). After that, it adds any users listed in `electricbook-users.txt`.

When running the EBM locally, you'll most likely maintain the `allowed_users` list in your `electricbook-0.yml` file, and just include the users you're using for testing. When deploying to a remote server, this file would be replaced by the values in your `hosts-*` file(s). So you can keep a list of users that must always have access (e.g. you and your close team) there if you like.

The `electricbook-users.txt` list is intended to make it easier to maintain a list of allowed users that changes often (e.g. if you have team members or clients that come and go). It is simpler to let admins edit that file on the server (either directly, or by uploading a latest version from time to time) than to run a full deployment every time you want to change the list.

None of these files (`electricbook-N.yml`, `hosts-*`, `electricbook-users.txt`) should be committed to version control.

After editing this file, you must restart the electricbook service for changes to take effect:

``` sh
systemctl restart electricbook
```

It will restart the app (not the server) at once, with your updated allowed users. The restart is so fast that the chances that it will disrupt a user's work are extremely small. If in restarting you happen to drop someone's session while they're doing something, e.g. halfway through a save, they will simply have to retry the action. That said, it's probably best to restart at a quiet time. 

The `make users-staging` and `make users-staging` commands will copy the file to the relevant server and restart the service.
