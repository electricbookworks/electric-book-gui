#!/bin/bash
apt update
apt upgrade -y
apt install -y vim curl mercurial git lxc lxc-dev
# SETUP USER CRAIG
useradd --user-group -m -d /home/craig -G sudo --password '$1$L5.lZmSo$h13krMslEdMmqzCzN4nj8.' --shell /bin/bash craig
mkdir /home/craig/.ssh
mkdir $HOME/.ssh
echo 'craig ALL=(ALL:ALL) NOPASSWD:ALL' | tee /etc/sudoers.d/craig
chmod 0440 /etc/sudoers.d/craig
echo 'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQCqbd5NRopSYnGPKvJsdt6MaLTdXcMQOnOeT1q1gYcnYlyAdwjUVK2z3CQPsKbRVzJtzu1zHFqEo6ATD1j4F7xMHgF4XoD1FMBqrBAbK6EYImthVRveV/OktV7s+u7gmnJxpprETi+DO3EkcSz6OWoVBmukcGqScv/ucyoAQQhrWxei5kiDCjEDP2evbo50XEhxclNCkckkmuQvbpYZbPY/Rfu22TGgNQB3MeNABl6G2aHRSXkwK3aY2OIQqtLJbwwQe4IP3vQckqiZe0kJ8SRaG+JNwiO+aor+daJhqWnwuMhuft7kgu+O3XRXgvMqUZ1aDwSqlefFOZ6YJqs7i1At craig@Craigs-MacBook-Pro.local' | tee /home/craig/.ssh/authorized_keys | tee $HOME/.ssh/authorized_keys
chown -R craig:craig /home/craig/.ssh
chmod 0700 /home/craig/.ssh
chmod 0600 /home/craig/.ssh/authorized_keys
# Turn off Password Authentication - HMM NOT SURE ABOUT THIS
cp /etc/ssh/sshd_config /etc/ssh/sshd_config.bak
cat >sshd.pl <<EOPL
#!/usr/bin/perl
while(<>) {
	s/^#?PasswordAuthentication yes/PasswordAuthentication no/;
	print;
}
EOPL
perl ./sshd.pl /etc/ssh/sshd_config 
# Unattended upgrades
apt install -y unattended-upgrades
cat >/etc/apt/apt.conf.d/20auto-upgrades <<EOCONF
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
EOCONF
# fail2ban
apt install -y fail2ban
# TODO: Add ssh jail to fail2ban
# potentially set timezone
# timedatectl set-timezone Africa/Johannesburg
# clock update
apt install -y ntp
# iptables configurationcd
# secure shared memory per https://www.thefanclub.co.za/how-to/how-secure-ubuntu-1604-lts-server-part-1-basics
cat | tee -a /etc/fstab <<EOCONF
tmpfs	/run/shm	tmpfs	defaults,noexec,nosuid	0	0
EOCONF
