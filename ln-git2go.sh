#!/bin/bash
set -e
pushd src/go/src/gopkg.in/libgit2
if [[ ! -d git2go.v25.orig ]]; then
	mv git2go.v25 git2go.v25.orig
	ln -s ~/proj/git2go ./git2go.v25
fi
popd
