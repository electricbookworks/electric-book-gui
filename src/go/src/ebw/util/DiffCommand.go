package util

import (
	"fmt"

	"github.com/craigmj/commander"
	"github.com/sergi/go-diff/diffmatchpatch"
)


func DiffCommand() *commander.Command {
	return commander.NewCommand("diff",
		"Show diff between two text strings",
		nil,
		func([]string) error {
			dmp := diffmatchpatch.New()
			
			text1 := `My 5:40 changes to README on 17 Oct 2017.`
			text2 := `Changes I'm making as CTA and Craigmj on 5 Mar 2018.

Upstream changes at 1009.
Changes at 1020.
Changes by CMJ at 1029.
1032 changes from CMJ.
859 changes on Thursday... `
			diffs := dmp.DiffMain(text1, text2, false)

			fmt.Println(dmp.DiffPrettyText(diffs))

			return nil
			})
}