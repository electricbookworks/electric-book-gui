#!/bin/bash
for f in $(find . -name "*.go"); do
	if grep "github.com/craigmj/git2go" $f; then
		echo $f
		sed -i.back 's/github.com\/craigmj\/git2go/github.com\/craigmj\/git2go\/v31/g' $f
	fi
done
