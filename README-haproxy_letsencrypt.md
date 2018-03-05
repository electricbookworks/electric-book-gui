# README - haproxy and letsencrypt

EBW serves the site through an haproxy proxy server. This enables haproxy metrics, the serving of other websites on the same server if desired, and the enabling of various http/s best-practices (timeouts, server and client limits) that can be implemented at the proxy layer, rather than being coded in the go server.

## ansible setup

The default haproxy setup is configured through the ansible scripts, particularly the `haproxy` role. In `tools/ansible/roles/haproxy/tasks/main.yml` the installation is defined. It might be instructive to look through that role definition file through this discussion:

1. Steps `install-haproxy` through `install-certbot` install `haproxy` and `certbot` from Ubuntu repos (and letsencrypt repo).
1. Steps `create-haproxy-lua-dir` through `copy-haproxy-lua-script` install the acme-validation plugin for haproxy from `https://github.com/janeczku/haproxy-acme-validation-plugin.git`. This plugin allows haproxy to handle certbot signature validation requests without interrupting haproxy.
1. Step `stop-haproxy-systemd` disables haproxy, and `get-certificate` fetches a certificate for the server's fqdn, using the certbot standalone server (this because we've not yet fully configured haproxy).
1. `merge-certificate` merges the certbot acquired certificates into a format required by haproxy
1. `configure-haproxy` does the configuration of haproxy, and notifies ansible that haproxy should be restarted (this will occur at the end of the installation)
1. Finally `cron-letsencrypt` configures the letsencrypt certificate renewal, using the script received from the lua plugin repo.

## haproxy configuration

haproxy is configured from the template `tools/ansible/roles/haproxy/templates/haproxy.cfg.j2`. The file is largely self-explanatory, while a few inlined comments describe particular configurations.

