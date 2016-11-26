package commander

import (
	"errors"
	"flag"
	"fmt"
	"os"
	"strings"
)

var ErrUnrecognizedCommand = errors.New("No command executed")

// Command wraps together the short command name, the description
// for a command, the commands Flags and the function that will handle
// the command.
type Command struct {
	Command     string
	Description string
	FlagSet     *flag.FlagSet
	F           func(args []string) error
}

// NewCommand creates a new comandeer Command struct with the given parameters.
func NewCommand(cmd, description string, flagset *flag.FlagSet, f func(args []string) error) *Command {
	return &Command{cmd, description, flagset, f}
}

// CommandFunction returns a command
type CommandFunction func() *Command

// MightExecute returns a boolean indicating if the command executed, and the error if it did
// (which can be nil if no error occurred)
// This is useful in a situation where you might execute a command, but don't mind if no command
// is executed, but want to catch an error if a command fails. This is coded as:
//
// if did,err=commander.MightExecute(...); did&&nil!=err {
//   panic(err)
// }
func MightExecute(args []string, commandFns ...CommandFunction) (bool, error) {
	err := Execute(args, commandFns...)
	return ErrUnrecognizedCommand != err, err
}

// MightExecuteWithErrorHandler might execute any command,
// and has an associated error handler if an error occurs.
// It returns true if a command was executed, false otherwise.
func MightExecuteWithErrorHandler(errHandler func(err error), args []string, commandFns ...CommandFunction) bool {
	b, err := MightExecute(args, commandFns...)
	if b && nil != err && ErrUnrecognizedCommand != err {
		errHandler(err)
	}
	return b
}

// Execute takes an args array, and executes the appropriate command from the
// array of commandFunctions. If nil is passed as the args array, os.Args is used
// by default.
func Execute(args []string, commandFns ...CommandFunction) error {
	if nil == args {
		args = os.Args[1:]
	}
	commands := make(map[string]*Command, len(commandFns))
	for _, c := range commandFns {
		cmd := c()
		commands[strings.ToLower(cmd.Command)] = cmd
	}

	if 0 == len(args) {
		// We return UnrecognizedCommand if no command exists
		return ErrUnrecognizedCommand
	}

	if strings.ToLower(args[0]) == "help" {
		if 1 < len(args) {
			for _, c := range args[1:] {
				cmd, ok := commands[strings.ToLower(c)]
				if !ok {
					fmt.Println("Unrecognized sub-command: ", cmd)
					continue
				}
				if nil != cmd.FlagSet {
					cmd.FlagSet.PrintDefaults()
				} else {
					fmt.Printf("%s takes no arguments: %s", cmd.Command, cmd.Description)
				}
			}
			return nil
		}
		fmt.Println(`Commands are:`)
		for _, c := range commands {
			fmt.Printf("%s\t\t%s\n", c.Command, c.Description)
		}
		return nil
	}

	c, ok := commands[strings.ToLower(args[0])]
	if !ok {
		return ErrUnrecognizedCommand
	}
	args = args[1:]
	if nil != c.FlagSet {
		c.FlagSet.Parse(args)
		args = c.FlagSet.Args()
	}
	return c.F(args)
}
