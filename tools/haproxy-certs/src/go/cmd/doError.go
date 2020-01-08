package cmd

import (
	"os"
	"fmt"

	"github.com/juju/errors"
)

func doError(err error) {
	if nil!=err {
		fmt.Fprintln(os.Stderr, errors.ErrorStack(err))
		os.Exit(1)
	}
}
