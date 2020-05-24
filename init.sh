#!/bin/bash

# This script checks for and, if necessary, installs
# Ansible, Node, Yarn, Watchman, Go, libgit2, and some Go utilities
# then runs an Ansible playbook to set up RUby and Jekyll as EBM dependencies

set -e
sudo apt-get update
sudo apt-get install -y curl git vim
if [[ ! $(which ansible-playbook) ]]; then
	sudo apt-get update
	sudo apt-get install -y software-properties-common
	sudo apt-add-repository --yes --update ppa:ansible/ansible
fi
if [[ ! $(which nodejs) ]]; then
	curl -sL https://deb.nodesource.com/setup_11.x | sudo -E bash -
fi
if [[ ! $(which yarn) ]]; then
	curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
	echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
fi
sudo apt-get update
sudo apt-get install -y libssl-dev libxml2-dev libhttp-parser-dev libssh2-1-dev curl libcurl4-gnutls-dev autoconf automake libtool git nodejs yarn libsass-dev git libssl-dev libxml2-dev libhttp-parser-dev libssh2-1-dev liblxc-dev cmake pkg-config lxc-common lxc-dev python-dev ruby-sass ansible

yarn install
sudo yarn global add rollup


pushd /usr/local/
if [[ ! $(which watchman) ]]; then
    if [[ ! -d watchman ]]; then
	    sudo git clone https://github.com/facebook/watchman.git
    fi
    pushd watchman
    sudo chown -R $USER:$USER .
    git checkout v4.9.0  # the latest stable release
    ./autogen.sh
    ./configure
    make
    sudo make install
    popd
fi

if [[ ! $(which go) ]]; then
	if [[ ! -d go ]]; then
		sudo curl -O 'https://dl.google.com/go/go1.11.4.linux-amd64.tar.gz'
		sudo tar -xvzf go1.11.4.linux-amd64.tar.gz
	fi
	echo "PATH=\$PATH:/usr/local/go/bin" | sudo tee -a /etc/profile
	. /etc/profile
fi

if [[ ! -d libgit2-0.25.1 ]]; then
	sudo curl -LO https://github.com/libgit2/libgit2/archive/v0.25.1.tar.gz
	sudo tar -xzf v0.25.1.tar.gz
	sudo rm v0.25.1.tar.gz

	pushd libgit2-0.25.1
	sudo chown -R $USER:$USER .
	if [[ ! -d build ]]; then
		mkdir build
	fi
	cd build
	cmake ..
	cmake --build .
	sudo cmake --build . --target install
	popd
fi

# pod returns us to our directory where we've got our classes
popd

pushd src/go
export GOPATH=`pwd`
go get -d gopkg.in/libgit2/git2go.v25
cd src/gopkg.in/libgit2/git2go.v25
git checkout next
git submodule update --init
if [[ ! -e repository_mergeheads.go ]]; then
	ln -s ../../../../git2go_fix/repository_mergeheads.go .
fi
make install
popd
go get -u github.com/kardianos/govendor
pushd src/go/src/ebw
../../bin/govendor sync
popd

pushd src/go/src/ebw/vendor/gopkg.in/libgit2/git2go.v25
if [[ ! -e repository_mergeheads.go ]]; then
	ln -s ../../../../../../git2go_fix/repository_mergeheads.go .
fi
make install
popd
sudo ldconfig

# NOW CONFIGURE RVM AND BOOKWORKS NECESSARY PARTS SO THAT PRINTING AND JEKYLL WILL WORK
pushd tools/ansible
ansible-playbook -i 'localhost,' -c local playbook-bookworks.yml
popd

# NOW WE INSTALL RUBIES FOR CURRENT USER - BOOKWORKS ANSIBLE DOESN'T SEEM TO DO IT RIGHT
# FOR THE CURRENT USER
source /usr/local/rvm/scripts/rvm
rvm install ruby-2.4.0


