#!/bin/bash
set -e
if [[ ! -f /usr/local/lib/libgit2.so ]]; then
	sudo apt install -y cmake curl pkg-config lxc-common lxc-dev
	# pushd will take us to user/local for installing libgit2
	pushd /usr/local
	LIBGITVER=1.1.0
	if [[ ! -d libgit2-$LIBGITVER ]]; then
		sudo curl -LO "https://github.com/libgit2/libgit2/releases/download/v$LIBGITVER/libgit2-$LIBGITVER.tar.gz"
		sudo tar -xzf libgit2-$LIBGITVER.tar.gz
		sudo rm libgit2-$LIBGITVER.tar.gz
	fi
	cd libgit2-$LIBGITVER
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
	sudo ldconfig
fi