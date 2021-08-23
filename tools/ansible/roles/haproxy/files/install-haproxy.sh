#!/bin/bash
set -e

## Installs haproxy and certbot on ubuntu 20.04 and above (eventually)
## Requires 2 parameter:
## 1. EMAIL of user for certbot confirmation
## 2. FQDN of server for certificate
EMAIL=$1
FQDN=$2

## script must run as root, or many of these commands will likely error

if [[ ! -d /etc/haproxy ]]; then
	apt install haproxy
fi

# Install certbot snap if certbot necessary
if [[ ! -f /snap/bin/certbot ]]; then
	apt-get remove certbot
	# refresh snap system
	snap install core
	snap refresh core
	snap install certbot --classic
	ln -s /snap/bin/certbot /usr/bin/certbot
fi

# Check whether we have a cert already
if [[ ! -f /etc/letsencrypt/live/$FQDN/haproxy.pem ]]; then
	systemctl stop haproxy
    certbot certonly --standalone -d "$FQDN" --renew-by-default --agree-tos --email "$EMAIL"
    cat /etc/letsencrypt/live/$FQDN/privkey.pem /etc/letsencrypt/live/$FQDN/fullchain.pem > /etc/letsencrypt/live/$FQDN/haproxy.pem
	systemctl start haproxy
fi

if [[ ! -f /etc/haproxy/ffdhe2048.txt ]]; then
	curl https://ssl-config.mozilla.org/ffdhe2048.txt > /etc/haproxy/ffdhe2048.txt
fi

# The rest of the configuration of haproxy happens in the ansible again