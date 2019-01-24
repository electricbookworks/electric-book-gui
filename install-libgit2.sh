#!/bin/bash
set -e
sudo apt install -y cmake curl pkg-config lxc-common lxc-dev
# pushd will take us to user/local for installing libgit2
pushd /usr/local/
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
fi
cd libgit2-0.25.1
sudo chown -R $USER:$USER .
if [[ ! -d build ]]; then
	mkdir build
fi
cd build
cmake ..
cmake --build .
sudo cmake --build . --target install
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
