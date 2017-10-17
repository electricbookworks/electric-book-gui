#/bin/bash
set -e
USER1=craigmj
USER2=capetownaikido

rm -rf $USER1-test-book
rm -rf $USER2-test-book
rm -rf test-book
rm -rf tmp-book
ebw -u $USER1 github delete-repo test-book || true
ebw -u $USER2 github delete-repo test-book || true