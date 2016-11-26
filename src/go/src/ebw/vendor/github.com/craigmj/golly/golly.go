package golly

import (
	"database/sql"
	"time"
)

// Set ErrorLog to report errors to your logging system
var ErrorLog func(err error)

type Golly struct {
	panicH func(interface{}) error
	retryH func(error, int, time.Duration) (time.Duration, error)

	failCount int
	failWait  time.Duration
}

// New returns a new golly struct configured with a default
// retry handler of RetryWithBackoff. The golly functions will automatically
// call New() for you, so there's no necessity to use New() yourself for
// basic golly usage.
func New() *Golly {
	return &Golly{
		retryH: RetryWithBackoff,
	}
}

// Panic creates a new Golly struct, and configures the panic handler.
func Panic(p func(interface{}) error) *Golly {
	return New().Panic(p)
}

// Retry creates a new Golly struct, and configures the retry handler.
func Retry(p func(error, int, time.Duration) (time.Duration, error)) *Golly {
	return New().Retry(p)
}

// Run creates a new Golly struct and runs the function with the
// golly default golly RetryWithBackoff error handling.
func Run(f func() error) error {
	return New().Run(f)
}

// DbOpen is a utility method that connects to a Database, and Ping's the
// database, permitting really easy data connection. It runs a standard
// golly.Run function to ensure that the connection MUST succeed
// before this function will return.
func DbOpen(driverName, datasourceName string) (*sql.DB, error) {
	var db *sql.DB
	var err error
	if err := Run(func() error {
		db, err = sql.Open(driverName, datasourceName)
		if nil != err {
			if nil != ErrorLog {
				ErrorLog(err)
			}
			return err
		}
		if err = db.Ping(); nil != err {
			db.Close()
			if nil != err && nil != ErrorLog {
				ErrorLog(err)
			}
			return err
		}
		return nil
	}); nil != err {
		return nil, err
	}
	return db, nil
}

// Panic sets the panic handler on the Golly struct. The panic handler
// will be called if the function that is Run panics. If the panic
// handler returns an error, golly's wait handler will receive the
// error and handle it as it would any other error.
func (g *Golly) Panic(p func(interface{}) error) *Golly {
	g.panicH = p
	return g
}

// Retry sets the retry handler. The retry handler determines whether golly
// should retry the Run function, or exit with an error. If the retry handler
// returns an error, golly's Run method returns the error. If it returns a nil
// error and a time.Duration, golly will wait for the duration, then retry the
// function.
func (g *Golly) Retry(retry func(err error, errorCount int, lastWait time.Duration) (time.Duration, error)) *Golly {
	g.retryH = retry
	return g
}

// Run gives golly the function that is to be executed with golly error
// handling. If the function returns an error, golly's retry handler determines
// whether to retry the function, or to return an error.
func (g *Golly) Run(f func() error) (err error) {
	r := func() error {
		if nil != g.panicH {
			defer func() {
				if e := recover(); nil != e {
					err = g.panicH(e)
				}
			}()
		}
		return f()
	}
	for {
		err = r()
		if nil == err {
			g.failCount = 0
			return nil
		}
		g.failCount++
		if nil == g.retryH {
			return err
		}
		g.failWait, err = g.retryH(err, g.failCount, g.failWait)
		if nil != err {
			return err
		}
		if 0 < g.failWait {
			time.Sleep(g.failWait)
		}
	}
}
