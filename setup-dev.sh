#!/bin/bash
# SOME BASIC DEPENDENCIES
sudo apt-get install git libssl-dev libxml2-dev libhttp-parser-dev libssh2-1-dev
# INSTALL YARN
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
sudo apt-get update 
sudo apt-get install yarn
# INSTALL YARN DEPENDENCIES
yarn install
sudo yarn global add gulp-cli rollup typescript
if [[ ! -f /usr/bin/env/node ]]; then
	sudo apt-get install -y nodejs-legacy
fi
# FORCE NODE_SASS REBUILD, WHICH SEEMS NECESSARY TO GET VENDOR DIRECTORY IN PLACE
npm rebuild node-sass --force

# INSTALL RVM
# This should be done in the bookworks playbook...
#sudo gpg --keyserver hkp://keys.gnupg.net --recv-keys 409B6B1796C275462A1703113804BB82D39DC0E3
#\curl -sSL https://get.rvm.io | bash -s stable

# CONFIGURE RVM AND BOOKWORKS NECESSARY PARTS SO THAT PRINTING AND JEKYLL WILL WORK
pushd tools/ansible
ansible-playbook -i 'localhost,' -c local playbook-bookworks.yml
popd

# NOW WE INSTALL RUBIES FOR CURRENT USER - BOOKWORKS ANSIBLE DOESN'T SEEM TO DO IT RIGHT
# FOR THE CURRENT USER
source /usr/local/rvm/scripts/rvm
rvm install ruby-2.4.0

cp repository_mergeheads.go src/go/src/gopkg.in/libgit2/git2go.v25/repository_mergeheads.go


