package print

import (
	"encoding/json"
	"flag"
	"os"

	"ebw/git"
	"github.com/craigmj/commander"
)

func PrintCommand() *commander.Command {
	fs := flag.NewFlagSet(`print`, flag.ExitOnError)
	contain := fs.Bool(`contain`, false, `Use containerization to print inside a container`)
	format := fs.String(`format`, `print`, `Format: 'print' or 'screen'`)

	return commander.NewCommand(`print`, `Print in container`,
		nil,
		func([]string) error {
			repoDir, err := git.RepoDir(`craigmj`, `craigmj`, `aikido-grading`)
			if nil != err {
				return err
			}
			C := make(chan PrintMessage)
			go func() {
				js := json.NewEncoder(os.Stdout)
				for m := range C {
					js.Encode(&m)
				}
			}()

			if *contain {
				_, err = PrintInContainer(repoDir, `book`, *format, C)
			} else {
				_, err = PrintLocal(repoDir, `book`, *format, ``, C)
			}
			return err
		})
}
