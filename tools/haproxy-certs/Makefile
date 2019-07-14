
SHELL := /bin/bash

SRC = $(shell find src/go/ -type f -name '*.go')

bin/haproxy-certs: $(SRC)
	pushd src/go; \
	go build -tags=dev -o ../../bin/haproxy-certs main.go; \
	popd

clean:
	-@rm -rf bin/haproxy-certs

dist: $(SRC) gen
	pushd src/go; \
	go build -o ../../bin/haproxy-certs main.go; \
	popd

gen: $(SRC)
	go generate src/go/web/public_generate.go

run: bin/haproxy-certs
	bin/haproxy-certs web

.PHONY: all clean gen test
