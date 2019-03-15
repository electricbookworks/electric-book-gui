package util

import (
	"time"

	// "github.com/golang/glog"
)

var tformat = `2006-01-02 15:04:05`

type chooser struct {
	anchor time.Time
	current time.Time
	choose func(a,c,t time.Time) bool
	name string
}

func NewChooserBefore(anchor time.Time) *chooser {
	return &chooser{
		anchor: anchor,
		choose: ChooseClosestBefore,
		name: `closest-before`,
	}
}

func NewChooserAfter(a time.Time) *chooser {
	return &chooser{
		anchor: a,
		choose: ChooseClosestAfter,
		name: `closest-after`,
	}
}

func (c *chooser) Choose(t time.Time) bool {
	if c.choose(c.anchor, c.current, t) {
		// glog.Infof(`Chooser %s choosing %s over %s as closer to %s`,
		// 	c.name, t.Format(tformat), c.current.Format(tformat),
		// 	c.anchor.Format(tformat))
		c.current = t
		return true
	} else {
		// glog.Infof(`Chooser %s rejected %s - %s is closer to %s`,
		// 	c.name, t.Format(tformat), c.current.Format(tformat),
		// 	c.anchor.Format(tformat))
	}
	return false
}

// ChooseClosest.Before will return true if you should change the currentDate to the testDate
func ChooseClosestBefore(anchorDate, currentDate, testDate time.Time) bool {
	if currentDate.IsZero() {
		return true
	}
	// CA
	if anchorDate.After(currentDate) {
		// if C - A - T don't switch
		if anchorDate.Before(testDate) {
			return false
		}
		// switch if CTA but not TCA
		return testDate.After(currentDate)
	}
	// AC
	// TAC
	if testDate.Before(anchorDate) {
		return true
	}
	// ATC but not ACT
	return testDate.Before(currentDate)
}

// ChooseClosesAfter returns true if the testDate is a closer date AFTER the anchorDate
// compared with the currentDate
func ChooseClosestAfter(anchorDate, currentDate, testDate time.Time) bool {
	if currentDate.IsZero() {
		return true
	}
	// AC
	if anchorDate.Before(currentDate) {
		// TAC
		if testDate.Before(anchorDate) {
			return false
		}
		// ATC but not ACT
		return testDate.Before(currentDate)
	}
	// CA
	if testDate.After(anchorDate) {
		// CAT
		return true
	}
	return testDate.After(currentDate)
}