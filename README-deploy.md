# Deployment

The deployment system uses Ansible (https://www.ansible.com), and the necessary scripts are in `tools/ansible`.

The ansible deployment needs a built `bin/electricbook` binary on the local machine, but otherwise uses the git repo. So first ensure that `./build.sh` has executed without error.

Then go to the `tools/ansible` directory:

Copy the `hosts-test` file to a file your own for deployment: eg `cp hosts-test hosts-production`

The edit `hosts-production` with appropriate values: the file itself contains details on each required
value.

Then ensure that your server will work with ansible. In my general experience this means:

1. You need a login on your server that can ssh without passworks (use `ssh-copy-id` to ensure you have passwordless login)
2. Your user must have passwordless sudo on the remote server: `echo "$USERNAME ALL=(ALL:ALL) NOPASSWD:ALL" | sudo tee /etc/sudoers.d/$USERNAME` 
3. Ensure you've got python and a few other items installed on the remote server: `sudo apt-get install -y python`

Now you can deploy to the remote server:

    ansible-playbook -i hosts-production playbook-bookserver.yml


