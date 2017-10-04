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
 go build -o bin/electricbook src/go/src/ebw/electricbook.go
if [[ "ebw" == $1 ]]; then
	go build -o bin/ebw src/go/src/ebw/ebw.go
fi
#go build -o bin/jekyllrun src/go/src/ebw/jekyllrun.go
cp bin/ebw ~/go/bin
#cp bin/jekyllrun ~/go/bin

