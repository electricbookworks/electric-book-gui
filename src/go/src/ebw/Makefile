SHELL := /bin/bash

SRC = $(shell find . -type f -name '*.go' -not -path "./vendor/*")
SCSS = $(shell find src/scss -type f -name '*.scss')

../../../../bin/electricbook: $(SRC)
	go build -o ../../../../bin/electricbook electricbook.go
	#GOPATH=`pwd`/src/go go build -o bin/electricbook src/go/src/ebw/electricbook.go

clean:
	-@rm -rf ../../../../bin/electricbook

gen:
	go generate ebw/api/JSONRpc.go

dev:
	gulp watch & \
	rollup -c --watch & \
	dtemplate -dir src/ts -lang ts -logtostderr -out src/ts/Templates.ts -watch & \
	bin/electricbook -logtostderr web

.PHONY: clean gen dev

