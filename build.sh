#!/bin/bash
set -e

# Set the Go path to the src directory in this folder
export GOPATH=`pwd`/src/go

# If libgit2 is not installed, install it
if [[ ! -d src/go/src/gopkg.in/libgit2/git2go.v25 ]]; then
	./install-libgit2.sh
fi

# If this build script is run with the gen argument,
# generate from JSONRpc.go
if [[ "gen" == $1 ]]; then
  go generate src/go/src/ebw/api/JSONRpc.go
fi
if [[ ! -d bin ]]; then
  mkdir bin
fi

# The main build command
go build -o bin/electricbook src/go/src/ebw/electricbook.go

# Build the ebw CLI binary if you ran `./build.sh ebw`
# and copy it to a folder in your path
if [[ "ebw" == $1 ]]; then
	go build -o bin/ebw src/go/src/ebw/ebw.go
  currentDirectory=$(pwd)
  echo "Copy bin/ebw to a folder in your PATH,"
  echo "or add it to your PATH temporarily with"
  echo "export PATH=\$PATH:$currentDirectory/bin"
fi
