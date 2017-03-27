package print

import (
	"bufio"
	"bytes"
	"errors"
	"fmt"
	"io/ioutil"
	"os"
	"regexp"

	"gopkg.in/lxc/go-lxc.v2"
)

func scanLxcConfig(filename string) (chan string, error) {
	inf, err := os.Open(filename)
	if nil != err {
		return nil, err
	}
	in := bufio.NewScanner(inf)
	C := make(chan string)
	go func() {
		defer inf.Close()
		defer close(C)
		for in.Scan() {
			C <- in.Text()
		}
	}()
	return C, nil
}

// EditLxcAddLine adds a line to the LXC config file.
// It will add the line, after it finds a line
// matching the `find` regexp. It will remove any
// line matching the 'duplicate' regexp.
// `n` is the name of the container to whose config this is
// being added.
func EditLxcAddLine(n string, find, duplicate *regexp.Regexp, line string) error {
	cont, err := lxc.NewContainer(n, lxc.DefaultConfigPath())
	if nil != err {
		return err
	}
	if !cont.Defined() {
		return errors.New("No container named " + n + " is defined")
	}
	C, err := scanLxcConfig(cont.ConfigFileName())
	if nil != err {
		return err
	}
	if err = writeLxcConfig(cont.ConfigFileName(),
		addLineToLxc(C, find, duplicate, line)); nil != err {
		return err
	}
	return nil
}

func addLineToLxc(C chan string, find, duplicate *regexp.Regexp, line string) chan string {
	D := make(chan string)
	go func() {
		defer close(D)
		found := false
		for l := range C {
			if duplicate.MatchString(l) {
				if !found {
					D <- line
					found = true
				}
			} else if find.MatchString(l) {
				D <- l
				if !found {
					D <- line
					found = true
				}
			} else {
				D <- l
			}
		}
		if !found {
			D <- line
		}
	}()
	return D
}

func writeLxcConfig(filename string, C chan string) error {
	var b bytes.Buffer
	for l := range C {
		fmt.Fprintln(&b, l)
	}
	if err := ioutil.WriteFile(filename, b.Bytes(), 0644); nil != err {
		return err
	}
	return nil
}
