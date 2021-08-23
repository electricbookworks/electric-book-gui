package util

import (
	"fmt"
	"io/ioutil"
	"os"
	"os/user"
	`strconv`
	"crypto/sha1"
	`path/filepath`

	`github.com/juju/errors`

)

// FileExists checks for the existence of the given file.
func FileExists(filename string) (bool, error) {
	if _, err := os.Stat(filename); nil != err {
		if os.IsNotExist(err) {
			return false, nil
		}
		return false, Error(err)
	}
	return true, nil
}

// CalcFileSHA return the SHA1 hash of the given file.
func CalcFileSHA(filename string) (*string, error) {
	raw, err := ioutil.ReadFile(filename)
	if nil != err {
		return nil, Error(err)
	}
	return CalcSHA(raw), nil
}

func CalcSHA(in []byte) *string {
	// The pattern for generating a hash is `sha1.New()`,
	// `sha1.Write(bytes)`, then `sha1.Sum([]byte{})`.
	// Here we start with a new hash.
	h := sha1.New()

	// `Write` expects bytes. If you have a string `s`,
	// use `[]byte(s)` to coerce it to bytes.
	h.Write(in)

	// This gets the finalized hash result as a byte
	// slice. The argument to `Sum` can be used to append
	// to an existing byte slice: it usually isn't needed.
	bs := h.Sum(nil)

	s := fmt.Sprintf("%x", bs)
	return &s
}

// WorkingDir returns the passed directory, or the current
// working directory if d is an empty string.
func WorkingDir(d string) string {
	if `` != d {
		return d
	}
	wd, err := os.Getwd()
	if nil != err {
		panic(err)
	}
	return wd
}

func SetOwner(dir string, owner, group string) error {
	u, err := user.Lookup(owner)
	if nil!=err {
		return fmt.Errorf(`Failed to find user %s: %w`, owner, err)
	}
	grp, err := user.LookupGroup(group)
	if nil!=err {
		return fmt.Errorf(`Failed to lookup group %s: %w`, group, err)
	}
	uid, err := strconv.Atoi(u.Uid)
	if nil!=err {
		return errors.Trace(err)
	}
	gid, err := strconv.Atoi(grp.Gid)
	if nil!=err {
		return errors.Trace(err)
	}

	fmt.Printf("chown -R %s:%s %s\n", owner, group, dir)

	return errors.Trace(filepath.Walk(dir, func(fn string, fi os.FileInfo, err error) error {
		if nil!=err {
			return err
		}
		if `..`==fn {
			return nil
		}
		file := fn
		if err := os.Chown(file, uid, gid); nil!=err {
			return fmt.Errorf(`Failed setting chown on %s: %w`, file, err)
		}
		return nil
	}))
}