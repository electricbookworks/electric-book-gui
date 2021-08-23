#!/bin/bash
set -e
if [[ ! -d /opt/prince-install ]]; then
	mkdir /opt/prince-install
fi
cd /opt/prince-install
if [[ $(lsb_release -sr) == '18.04' ]]; then

# Electric Book template styles not yet fully compatible with Prince 12,
# so we're sticking Prince 11 for now.
	# export PRINCE=prince_12.2-1_ubuntu$(lsb_release -sr)_amd64.deb
	PRINCE=prince_11.4-1_ubuntu$(lsb_release -sr)_amd64.deb
fi
if [[ $(lsb_release -sr) == '16.04' ]]; then
	PRINCE=prince_11.4-1_ubuntu$(lsb_release -sr)_amd64.deb
fi
if [[ $(lsb_release -sr) == '20.04' ]]; then
	  sudo apt install -y \
	    libfontconfig1 \
	    fontconfig-config \
	    fonts-dejavu-core \
	    libfreetype6 \
	    libgif7 \
	    libjpeg8 \
	    libjpeg-turbo8 \
	    liblcms2-2 \
	    libpixman-1-0 \
	    libpng16-16 \
	    libtiff5 \
	    libjbig0 \
	    libwebp6
	PRINCE=prince_14-1_ubuntu$(lsb_release -sr)_amd64.deb
fi

if [[ ! -e $PRINCE ]]; then
	curl -O https://www.princexml.com/download/$PRINCE
fi

dpkg -i $PRINCE
apt-get install -f -y
