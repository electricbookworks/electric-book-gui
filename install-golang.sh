#!/bin/bash
set -e
GOVER=1.16.1
if [ "$EUID" -ne 0 ]
  then echo "Please run as root with sudo"
  exit 1
fi
apt install -y curl build-essential pkg-config
pushd /usr/local/
if [[ ! $(which go) ]]; then
	if [[ ! -d go ]]; then
		curl -L "https://golang.org/dl/go$GOVER.linux-amd64.tar.gz" | tar -xz
	fi
	echo "PATH=\$PATH:/usr/local/go/bin" | sudo tee -a /etc/profile
	. /etc/profile
fi
