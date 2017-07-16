#!/bin/bash
set -e
sudo apt install -y cmake
# pushd will take us to user/local for installing libgit2
pushd /usr/local/
if [[ ! -d libgit2 ]]; then
	sudo git clone https://github.com/libgit2/libgit2.git
fi
cd libgit2
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
make install
popd
