#!/bin/bash
set -e
# boilerplate test jekyll site
cd /tmp
rm -rf jekylltest
source /usr/local/rvm/scripts/rvm
gem install jekyll
jekyll new jekylltest
cd jekylltest
  gem install bundler
cd ..

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
