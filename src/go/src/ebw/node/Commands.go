package node

import (
	"flag"
	"os"
	`fmt`

	`github.com/golang/glog`
	"github.com/craigmj/commander"
)

func InstallNodeCommand() *commander.Command {
	fs := flag.NewFlagSet(`install-node`, flag.ExitOnError)
	dir := fs.String(`dir`,`.`,`Directory to install node`)
	owner := fs.String(`owner`,``,`Owner of the installed node directory`)
	group := fs.String(`group`,``,`Group owner of the installed node directory`)
	return commander.NewCommand(
		`install-node`,
		`Installs Node`,
		fs,
		func([]string) error {
			return InstallNode(*dir, *owner, *group)
		})
}

func RunNodeCommand() *commander.Command {
	fs := flag.NewFlagSet(`node`, flag.ExitOnError)
	dir := fs.String(`dir`, `.`,`Directory in which to run`)
	return commander.NewCommand(
		`node`,
		`Run node (or npm or npx) from the install directory`,
		fs,
		func(args []string) error {
			glog.Infof(`dir=%s, cmd=%s`, *dir, args[0])
			node := Command(*dir, args[0], args[1:]...)
			node.Stdout, node.Stderr = os.Stdout, os.Stderr
			return node.Run()
		})
}


func NodeEnvCommand() *commander.Command {
	return commander.NewCommand(
		`nodeenv`,
		`Return the environment vars for running node`,
		nil,
		func(args []string) error {
			for _, c := range Env(map[string]string{}) {
				fmt.Println("export", c)
			}
			return nil
		})
}