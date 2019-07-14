// +build ignore

package main

//go:generate go run -tags=dev public_generate.go

import (
	"net/http"
	"log"

	"github.com/shurcooL/vfsgen"
)

func main() {
	if err := vfsgen.Generate(http.FileSystem(http.Dir("../../../public")), vfsgen.Options{
		PackageName: "web",
		BuildTags: "!dev",
		VariableName: "Public",
	}); nil!=err {
		log.Fatal(err)
	}
}
