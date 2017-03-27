package www

import (
	"flag"

	"github.com/craigmj/commander"

	"ebw/config"
)

func WebCommand() *commander.Command {
	fs := flag.NewFlagSet("web", flag.ExitOnError)
	bind := fs.String("bind", "", "address and port to bind")
	return commander.NewCommand("web",
		"Webserver",
		fs,
		func([]string) error {
			b := *bind
			if `` == b {
				b = config.Config.Bind
			}
			return RunWebServer(b)
		})
}
