---
title: Deploying the EBM
---

# Deploying the EBM

The deployment system uses [Ansible](https://www.ansible.com), and the necessary scripts are in `tools/ansible`.

The Ansible deployment needs a built `bin/electricbook` binary on your local machine, but otherwise uses the files in your local git repo. So first ensure that `./build.sh` has executed without error.

Then go to the `tools/ansible` directory:

1. Copy the `hosts-test` file to a file your own for deployment. E.g.

       cp hosts-test hosts-production

2. Then edit `hosts-production` with appropriate values. The file contains details on each required value.
3. Then ensure that your server will work with Ansible. This usually means:

    1. You need a login on your server that can ssh without passwords (use [`ssh-copy-id`](https://www.ssh.com/ssh/copy-id) to ensure you have passwordless login).
    2. Your user must have passwordless sudo on the remote server: `echo "$USERNAME ALL=(ALL:ALL) NOPASSWD:ALL" | sudo tee /etc/sudoers.d/$USERNAME`
    3. Ensure you've got python and a few other items installed on the remote server: `sudo apt-get install -y python`

4. Now you can deploy to the remote server:

       ansible-playbook -i hosts-production playbook-bookserver.yml
