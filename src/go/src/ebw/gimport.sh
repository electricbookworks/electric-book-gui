#!/bin/bash
for f in $(find . -name "*.go"); do
	if grep "github.com/libgit2/git2go" $f; then
		echo $f
		sed -i.back 's/github.com\/libgit2\/git2go\/\?/github.com\/libgit2\/git2go\/v31/g' $f
	fi
done
