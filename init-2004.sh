#!/bin/bash
set -e
echo 'ruby installation now done by golang - do not use this'
exit 1
echo 'installing ruby and rvm'
sudo apt-get install software-properties-common
sudo apt-add-repository -y ppa:rael-gc/rvm
sudo apt-get update
sudo apt-get install -y rvm
sudo usermod -a -G rvm $USER
echo "ADDING /usr/share/rvm/bin/ to ~/.profile"
cp ~/.profile ~/.profile.bak
cat <<EOAWK > _awk_profile.awk
{
	if (!/ebw-init-script-rvm-path/) {
		print;
	}
}
END {
	print "export PATH=$PATH:/usr/share/rvm/bin    # ebw-init-script-rvm-path";
}
EOAWK
awk --file _awk_profile.awk ~/.profile.bak > ~/.profile
rm _awk_profile.awk
source ~/.profile
rvm install ruby-2.7.2
