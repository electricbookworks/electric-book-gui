SHELL := /bin/bash

SRC = $(shell find src/go -type f -name '*.go' -not -path "./vendor/*")
SCSS = $(shell find src/scss -type f -name '*.scss')

bin/electricbook: $(SRC)
	cd src/go/src/ebw; make

bin/ebw: $(SRC)
	GOPATH=`pwd`/src/go go build -o bin/ebw src/go/src/ebw/ebw.go

all: bin/electricbook bin/ebw
	@echo 'DONE'

clean:
	-@rm -rf bin/electricbook
	-@rm -rf bin/ebw

css: public/css/main.css
	@echo 'CSS Compiled'

public/css/main.css: $(SCSS)
	scss -I 'lib/bower_components/' -I 'public/bower_components/' src/scss/main.scss public/css/main.css
	uglifycss public/css/main.css > public/css/main.min.css 

gen:
	GOPATH=`pwd`/src/go go generate src/go/src/ebw/api/JSONRpc.go

prepare:
	export GOPATH=`pwd`/src/go ; \
	go get -u github.com/kardianos/govendor; \
	pushd src/go/src/ebw; \
	../../bin/govendor sync; \
	popd; \
	./install-libgit2.sh

run: bin/electricbook
	bin/electricbook -logtostderr web

deploy-staging:
	pushd tools/ansible; \
	ansible-playbook -i hosts-staging playbook-bookserver.yml; \
	popd

deploy-production:
	pushd tools/ansible; \
	ansible-playbook -i hosts-production playbook-bookserver.yml; \
	popd

users-staging:
	pushd tools/ansible; \
	ansible-playbook -i hosts-staging playbook-update-users.yml; \
	popd

users-production:
	pushd tools/ansible; \
	ansible-playbook -i hosts-production playbook-update-users.yml; \
	popd

test:
	GOPATH=`pwd`/src/go go test ebw/git -logtostderr 

dev:
	gulp watch & \
	rollup -c --watch & \
	dtemplate -dir src/ts -lang ts -logtostderr -out src/ts/Templates.ts -watch & \
	bin/electricbook -logtostderr web

.PHONY: all clean css gen prepare test deploy-staging deploy-production

