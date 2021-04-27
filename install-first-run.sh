#!/bin/bash
set -e
# boilerplate test jekyll site
cd /tmp
rm -rf jekylltest
source /usr/share/rvm/scripts/rvm

# Note that the EB template does not support Jekyll => 3.9
gem install jekyll --version 3.8.6
gem install bundler
jekyll new jekylltest

# clone Electric Book Works template
# This is required to ensure that everything is configured
if [[ ! -e electric-book ]]; then
  git clone https://github.com/electricbookworks/electric-book.git
fi

# create PDF from template book - this is purely a test, 
# and doesn't
# work well against a container (because no gui)
cd electric-book
bundle install
