# haproxy-certs

haproxy-certs is a small utility program that scans the letsencrypt directories in search of haproxy.pem files that are older than the related privkey.pem and fullchain.pem files. If it finds any, it recreates the haproxy.pem files, and restart haproxy.

It can automatically run the haproxy script renewal file, and automatically reload haproxy if it has updated any certificates.

This utility seems necessary since haproxy's renew cert file doesn't seem to work, for reasons I do not understand (the code is all in place, but it doesn't seem to execute on electricbook.works).

