// +build dev

package web

import "net/http"

var Public http.FileSystem = http.Dir("public")

