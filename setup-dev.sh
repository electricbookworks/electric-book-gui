#!/bin/bash
# SOME BASIC DEPENDENCIES
sudo apt-get install libssl-dev libxml2-dev libhttp-parser-dev libssh2-1-dev
# INSTALL YARN
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
sudo apt-get update 
sudo apt-get install yarn
# INSTALL YARN DEPENDENCIES
yarn install
sudo yarn global add gulp-cli
if [[ ! -f /usr/bin/env/node ]]; then
	sudo apt-get install -y nodejs-legacy
fi
# FORCE NODE_SASS REBUILD, WHICH SEEMS NECESSARY TO GET VENDOR DIRECTORY IN PLACE
npm rebuild node-sass --force
