package www

import (
	"flag"

	"github.com/craigmj/commander"
)

func WebCommand() *commander.Command {
	fs := flag.NewFlagSet("web", flag.ExitOnError)
	bind := fs.String("bind", ":16101", "address and port to bind")
	return commander.NewCommand("web",
		"Webserver",
		fs,
		func([]string) error {
			return RunWebServer(*bind)
		})
}
