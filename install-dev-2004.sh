#!/bin/bash
set -xe
sudo apt update
sudo apt install -y git curl build-essential pkg-config libssl-dev
git clone https://github.com/electricbookworks/electric-book-gui.git
cd electric-book-gui
git fetch origin dev-2004
git checkout dev-2004
./install-golang.sh
. /etc/profile
./install-libgit2.sh
./install-prince.sh
