package util

import (
	`time`
)

func ParseTime(in string) (time.Time, error) {
	var t time.Time
	var err error
	for _, f := range []string{`2006-01-02`, `2016/01/02`, `20060102`,`060102`} {
		t, err = time.Parse(f, in)
		if nil==err {
			return t, nil
		}
	}
	return time.Time{}, err
}