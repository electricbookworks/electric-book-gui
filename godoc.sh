#!/bin/bash
export GOPATH=`pwd`/src/go
echo "godoc on http://localhost:6060"
godoc -index -http=':6060'
