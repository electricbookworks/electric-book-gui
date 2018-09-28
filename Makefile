SHELL := /bin/bash

SRC = $(shell find src/go -type f -name '*.go' -not -path "./vendor/*")

bin/electricbook: $(SRC)
	GOPATH=`pwd`/src/go go build -o bin/electricbook src/go/src/ebw/electricbook.go

bin/ebw: ($SRC)
	GOPATH=`pwd`/src/go go build -o bin/ebw src/go/src/ebw/ebw.go

all: bin/electricbook bin/ebw
	echo 'DONE'

clean:
	-@rm -rf bin/electricbook
	-@rm -rf bin/ebw

gen:
	GOPATH=`pwd`/src/go go generate src/go/src/ebw/api/JSONRpc.go

run: bin/electricbook
	bin/electricbook -logtostderr web

prepare:
	export GOPATH=`pwd`/src/go ; \
	go get -u github.com/kardianos/govendor; \
	pushd src/go/src/ebw; \
	../../bin/govendor sync; \
	popd; \
	./install-libgit2.sh

test:
	GOPATH=`pwd`/src/go go test ebw/git -logtostderr 

.PHONY: clean gen prepare test

