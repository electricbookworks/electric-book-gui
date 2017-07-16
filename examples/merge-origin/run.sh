#!/bin/bash
set -e
mkdir origin
cd origin
git init
echo 'This file will be deleted in fork, and modified in origin.' > delete-in-fork.txt
echo 'This file will be deleted in origin, and modified in fork.' > delete-in-origin.txt
echo 'This is a file that we will fast-forward in our test.' > fastforward.txt
echo 'This is the initial README.md' > README.md
cat <<EOF > modify.txt
Line 1: Hi there
Line 2: Second line
Line 3: Third line
EOF
git add delete-in-fork.txt delete-in-origin.txt fastforward.txt README.md modify.txt
git commit -m "Initial release"

cd ..
git clone origin fork
cd fork

echo 'This is the modified README.md in the fork.' > README.md
echo 'This is a new file in the fork.' > FORK.md
cat <<EOF > modify.txt
Line 1: Hi there
Line 2: Second line
Line 3: Third line
Line 4: A fourth line added in fork.
EOF
echo 'We make some changes in fork' > delete-in-origin.txt
git rm delete-in-fork.txt
git add README.md FORK.md modify.txt delete-in-origin.txt
git commit -m "Fork makes some changes"

cd ../origin
echo 'This is the modified README.md in the origin.' > README.md
echo 'This is the fast-forward file v2' > fastforward.txt
echo 'A new file that will arrive with the pull.' > newfile.txt
echo 'We make some changes in origin' > delete-in-fork.txt
cat <<EOF > modify.txt
Line 1: Hi there modified in origin.
Line 2: Second line
Line 3: Third line
EOF
git rm delete-in-origin.txt
git add README.md fastforward.txt newfile.txt modify.txt delete-in-fork.txt
git commit -m "Modified README.md, fastfoward and newfile, modify and deleted file in the origin"

cat <<EOE
At this point 'cd fork ; ebw -u craigmj book pull'
should end up with:
FORK.md : unchanged
README.md : conflicted
fastfoward.txt : fast-forwarded, not conflicted but changed
newfile.txt : not conflicted but added
modify.txt : not conflicted but changed and merged ok.
delete-in-fork.txt : conflicted
delete-in-origin.txt : conflicted
EOE
