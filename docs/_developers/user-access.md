---
title: User access
description: "You can restrict who can log into your Electric Book Manager, for only your specified users."
---

# User access

You can restrict who can log into your EBM by setting the `allowed_users:` in an `electricbook-N.yml` configuration file (where `N` is a number). This means you can have an Electric Book Manager for only your specified users.

After editing this file, you must restart the electricbook service for changes to take effect:

    systemctl restart electricbook

It will restart at once, with your updated allowed users. Do this at a quiet time, possibly notifying your users in advance. If in restarting you happen to drop someone's session while they're doing something, e.g. halfway through a save, they will simply have to retry the action.
