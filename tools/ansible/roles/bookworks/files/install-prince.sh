#!/bin/bash
# install prince
set -e
if [[ ! -d /opt/prince-install ]]; then
	mkdir /opt/prince-install
fi
cd /opt/prince-install
export PRINCE=prince_11.1-1_ubuntu$(lsb_release -sr)_amd64.deb
export PRINCE=prince_12.2-1_ubuntu$(lsb_release -sr)_amd64.deb
if [[ ! -e $PRINCE ]]; then
	curl -O https://www.princexml.com/download/$PRINCE
fi
dpkg -i $PRINCE
apt-get install -f -y
