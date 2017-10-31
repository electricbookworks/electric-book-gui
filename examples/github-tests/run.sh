#/bin/bash
set -e
USER1=craigmj
USER2=capetownaikido

# check_files_equal checks that the two given parameter files contain the same
# data.
check_files_equal () {
	MD1=$(openssl md5 $1 | awk '{print $2}')
	MD2=$(openssl md5 $2 | awk '{print $2}')
	if [[ $MD1 == $MD2 ]]; then
		return
	fi
	echo "ERROR: $1 DOES NOT MATCH $2"
	exit 1;
}

if [[ 1 ]]; then
rm -rf $USER1-test-book
rm -rf $USER2-test-book
rm -rf test-book
rm -rf tmp-book
ebw -u $USER1 github delete-repo test-book || true
ebw -u $USER2 github delete-repo test-book || true

if [[ "clean" == $1 ]]; then
	exit 0;
fi

# Test ebw repo functionality

# We want to test that three-types of merging are operating correctly. Firstly,
# we begin with the most basic functionality:

## Create a new book
ebw -u $USER1 book new -template craigmj/basic-test test-book
mv "test-book" $USER1-test-book

## USER2 will contribute to the book before USER1 has made any changes
echo "$USER2 will contribute to book craigmj/test-book"
ebw -u $USER2 book contribute craigmj/test-book
mv test-book "$USER2-test-book"

## USER1 makes a change to the book
cd  $USER1-test-book
echo 'Hi there, this is 01.md' > 01.md
git add 01.md
echo 'Hi there in 02.md' > 02.md
git add 02.md
git commit -m "first change in origin" && git push origin master

## USER2 pulls from upstream
cd ../$USER2-test-book
ebw book pull-upstream
check_files_equal ../$USER1-test-book/01.md ./01.md

## USER1 makes another change to the book
cd ../$USER1-test-book
echo 'Hi there from USER1, change 2' > 01.md
git add 01.md
git commit -m "second change from user1" && git push origin master

## USER2 pulls from upstream again
cd ../$USER2-test-book
ebw book pull-upstream
check_files_equal ../$USER1-test-book/01.md ./01.md

## USER1 makes a third change
cd ../$USER1-test-book
echo 'Change 3 from USER1' > 01.md
git commit -am "third change from user1" && git push origin master

## USER2 makes a change to the same file
cd ../$USER2-test-book
echo 'Change 4 from USER2' > 01.md
git commit -am "change number 4 from user 2" && git push origin master
if ! ebw git upstream-can-pull; then
	echo "ERROR: Expected to be able to pull from upstream."
	exit 1
fi
ebw book pull-upstream

## At this point, our file 01.md should be conflicted
if [[ "0" == $(ebw git has-conflicts) ]]; then
	echo "ERROR: 01.md should be conflicted, but it is not reporting as conflicted"
	exit 1
fi

## Check that our files are in a git-conflicted state in the working directory
## ie that our file contains GIT resolution issues
if ! grep '<<< HEAD' 01.md; then
	echo "ERROR: Expected 01.md to be in git-conflicted state, but it doesn't show git conflicts"
	exit 1
fi

## Resolving our 01.md should resolve the conflicts
echo "USER2 resolves the conflicts" > 01.md
git add 01.md && git commit -m "merged" && git push origin master

if ebw git upstream-can-pull; then
	echo "ERROR: Should not be able to pull from upstream, since just merged."
	exit 1
fi

if ebw git has-conflicts; then
	echo "ERROR: We resolved the conflict with upstream, but our repo is still conflicted!"
	exit 1
fi

cd ../$USER1-test-book
git rm 02.md
git commit -m 'removed 02' && git push origin master
cd ../$USER2-test-book
if ! ebw git upstream-can-pull; then
	echo "ERROR: Second attempt to pull from upstream, but reporting we can't pull from upstream"
	exit 1
fi
ebw book pull-upstream
if [[ -f 02.md ]]; then
	echo "ERROR: failed to propagate deletion of 02.md from upstream"
	exit 1
fi

echo "--- PULL FROM UPSTREAM WORKS, WITH AND WITHOUT CONFLICTS ---"

## Check that pull-from-origin works
cd ..
cp -R $USER2-test-book tmp-book
cd tmp-book
echo 'Change 5 from USER2 in tmp directory' > 01.md
git add 01.md && git commit -m 'change 5 from USER2' && git push origin master

cd ../$USER2-test-book
ebw book pull-origin
check_files_equal ../tmp-book/01.md ./01.md

echo '--- PULL FROM ORIGIN WORKS ---'

## Test pull requests
cd ../$USER2-test-book
echo "Creating pull request"
PRN=$(ebw book pr-create -title 'Pull request test')
echo "Created pull request $PRN"
cd ../$USER1-test-book
ebw book pr-merge -n $PRN
if ! ebw git has-conflicts; then
	echo 'ERROR : Expected conflicts post PR merge, but did not find any'
	exit 1
fi

else
	cd $USER1-test-book
fi

## CHECK THE CONFLICTED FILES
CONFLICTS=$(ebw git list-conflicts)
if [[ ! "01.md" == $(ebw git list-conflicts) ]]; then
	echo "Expected single conflict: 01.md, but got $(ebw git list-conflicts)"
	exit 1
fi

# ebw git file-cat -v our-wd 01.md
OURWD=$(ebw git file-cat -v our-wd 01.md)
OURHEAD=$(ebw git file-cat -v our-head 01.md)
if [[ ! $OURWD == $OURHEAD ]]; then
	echo "Our HEAD != Our WD"
	exit 1
fi

THEIRHEAD=$(ebw git file-cat -v their-head 01.md)
THEIRWD=$(ebw git file-cat -v their-wd 01.md)
if [[ ! $THEIRHEAD == $THEIRWD ]]; then
	echo "Their HEAD != Their WD"
	exit 1
fi

THEIRS=$(cat ../$USER2-test-book/01.md)
if [[ ! $THEIRS == $THEIRHEAD ]]; then
	echo "Their HEAD != USER2 original";
	exit 1
fi

if [[ $OURWD == $THEIRWD ]]; then
	echo "Our WD == Their WD - expected conflict"
	exit 1
fi

echo "PR result" > 01.md

if ! ebw git remove-conflict 01.md; then
	echo "remove-conflict on 01.md failed"
	exit 1
fi

# NOTE THAT GIT COMMIT WILL ALSO CLOSE THE PULL-REQUEST
if ! ebw git commit "pr 1 merged"; then
	echo "git commit failed"
	exit 1
fi

if ! ebw git push; then
	echo 'git push to github failed'
	exit 1
fi

echo 'CHECK CREATING A NEW FILE IN A PR'
## Test pull requests
cd ../$USER2-test-book
echo 'new file 03.md' > 03.md
git add 03.md && git commit -m 'new file 03' && git push origin master
echo "Creating pull request"
PRN=$(ebw book pr-create -title 'Pull request test')
echo "Created pull request $PRN"
cd ../$USER1-test-book
ebw book pr-merge -n $PRN
if ! ebw git has-conflicts; then
	echo 'ERROR : Expected conflicts post PR merge, but did not find any'
	exit 1
fi
## CHECK THE CONFLICTED FILES
CONFLICTS=$(ebw git list-conflicts)
if [[ ! "03.md" == $(ebw git list-conflicts) ]]; then
	echo "Expected single conflict: 03.md, but got $(ebw git list-conflicts)"
	exit 1
fi



else
	cd $USER1-test-book
fi


echo "ALL TESTS PASSED"
# Finally, remove the repo
#ebw -u $USER1 github delete-repo test-book
#ebw -u $USER2 github delete-repo test-book
#rm -rf $USER1-test-book
#rm -rf $USER2-test-book


