---
title: Deploying the EBM
---

# Deploying the EBM

## Quick deploy

Once you are set up, you can deploy a staging site by running from the root directory:

    make deploy-staging

And the same for production with:

    make deploy-production

## Setting up

The deployment system uses [Ansible](https://www.ansible.com), and the necessary scripts are in `tools/ansible`.

The Ansible deployment needs a built `bin/electricbook` binary on your local machine, but otherwise uses the files in your local git repo. So first ensure that `./build.sh` (or `make`, which runs that script) has executed without error, and that you have committed any changes to your local repo (e.g. changes to the HTML files in `public`).

Then go to the `tools/ansible` directory:

1. Copy the `hosts-example` file to a file your own for deployment. E.g.

       cp hosts-example hosts-staging

    Do not commit this file to version control, because it contains confidential information. (It should be ignored already by `.gitignore`.)

2. Then edit `hosts-staging` with appropriate values. The file contains details on each required value. E.g.

   ```
   email_host=mail.electricbook.works
   ```

3. Then ensure that your server will work with Ansible. This usually means:

    1. You need a login on your server that can ssh without passwords (use [`ssh-copy-id`](https://www.ssh.com/ssh/copy-id) to ensure you have passwordless login).
    2. Your user must have passwordless sudo on the remote server: `echo "$USERNAME ALL=(ALL:ALL) NOPASSWD:ALL" | sudo tee /etc/sudoers.d/$USERNAME`
    3. Ensure you've got python and a few other items installed on the remote server: `sudo apt-get install -y python`

4. Now you can deploy to the remote server. To do this, either:

    - from the repo root, run `make deploy-staging`, or
    - from the `tools/ansible` directory, run `ansible-playbook -i hosts-staging playbook-bookserver.yml`.

5. Set up similarly for deploying to production by switching `staging` in the file names above for `production`.
