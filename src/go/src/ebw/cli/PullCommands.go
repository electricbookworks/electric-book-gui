package cli

import (
	"fmt"
	"regexp"
	"strconv"

	"github.com/craigmj/commander"
	// "ebw/git"
	// "ebw/util"
)

func PullCommand() *commander.Command {
	return commander.NewCommand(`pull`,
		`Pull from upstream/origin/pr`,
		nil,
		func(args []string) error {
			repo, err := cliRepo()
			if nil != err {
				return err
			}
			defer repo.Free()

			if 1 != len(args) {
				return fmt.Errorf(`Must provide 1 arg, provided %d`, len(args))
			}
			switch args[0] {
			case `upstream`:
				return repo.PullUpstream()
			case `origin`:
				return repo.PullOrigin()
			default:
				matches := regexp.MustCompile(`^pr(\d+)$`).FindStringSubmatch(args[0])
				if nil == matches {
					return fmt.Errorf(`arg must be upstream | origin | prN`)
				}
				// n must parse OK since we know it's just \d+ from the regex
				n, _ := strconv.ParseInt(matches[0], 10, 64)
				return repo.PullPR(int(n))
			}
			return nil
		})
}
