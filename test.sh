#!/bin/bash
set -e
export GOPATH=`pwd`/src/go
if [[ ! -d src/go/src/gopkg.in/libgit2/git2go.v25 ]]; then
	./install-libgit2.sh
fi
if [[ "gen" == $1 ]]; then
  go generate src/go/src/ebw/api/JSONRpc.go
fi
if [[ ! -d bin ]]; then
  mkdir bin
fi
go test ebw/git

