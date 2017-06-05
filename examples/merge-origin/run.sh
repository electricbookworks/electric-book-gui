#!/bin/bash
set -e
mkdir origin
cd origin
git init
cat <<EOF > README.md
This is the initial README.md
EOF
git add README.md && git commit -m "Initial release"
cd ..
git clone origin fork
cd fork
cat <<EOF > README.md
This is the modified README.md in the fork.
EOF
git add README.md
cat <<EOF > FORK.md
This is a new file in the fork.
EOF
git add FORK.md
git commit -m "Fork makes some changes"
cd ../origin
cat <<EOF > README.md
This is the modified README.md in the origin.
EOF
git add README.md
git commit -m "Modified README.md in the origin"
cat <<EOE
At this point 'cd fork ; git fetch origin master; git merge origin/master' should force a conflict state.
EOE
