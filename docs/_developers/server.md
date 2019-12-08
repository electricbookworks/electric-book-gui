---
title: Server setup
---

# Server setup
{:.no_toc}

* TOC here
{:toc}

EBW serves the site through an HAProxy proxy server. This enables HAProxy metrics, the serving of other websites on the same server if desired, and the enabling of various http/s best-practices (timeouts, server and client limits) that can be implemented at the proxy layer, rather than being coded in the Go server.

## Ansible configuration

The default HAProxy setup is configured through the Ansible scripts, particularly the `haproxy` role. In `tools/ansible/roles/haproxy/tasks/main.yml` the installation is defined. It might be instructive to look through that role definition file through this discussion:

1. Steps `install-haproxy` through `install-certbot` install `haproxy` and `certbot` from Ubuntu repos and the Let’s Encrypt repo.
1. Steps `create-haproxy-lua-dir` through `copy-haproxy-lua-script` install the acme-validation plugin for HAProxy from `https://github.com/janeczku/haproxy-acme-validation-plugin.git`. This plugin allows HAProxy to handle certbot signature validation requests without interrupting HAProxy.
1. Step `stop-haproxy-systemd` disables HAProxy, and `get-certificate` fetches a certificate for the server's fqdn, using the certbot standalone server (this because we've not yet fully configured HAProxy).
1. `merge-certificate` merges the certbot acquired certificates into a format required by HAProxy.
1. `configure-haproxy` does the configuration of HAProxy, and notifies Ansible that HAProxy should be restarted (this will occur at the end of the installation).
1. Finally `cron-letsencrypt` configures the Let's Encrypt certificate renewal, using the script received from the lua plugin repo.

## HAProxy configuration

HAProxy is configured from the template `tools/ansible/roles/haproxy/templates/haproxy.cfg.j2`. The file is largely self-explanatory, while a few inlined comments describe particular configurations.
