# golly
A transient error handling library for Go, like Polly. But for Go.

# Usage

Golly is really simple, and short. It's a convenience, and there's no reason not to look at the code to see how it works. The most basic example, that connects to a MySQL server:

	var err error
	var db *sql.DB
	mysqlConnection = "[connection-parameters]"

	err = golly.Run(func() error {
		db, err = sql.Open("mysql", mysqlConnection)
		if nil!=err {
			return err
		}
		// Ping is required to check that the server is really there
		return db.Ping()
	})

This example will attempt to connect to the mysql server, and ping the server to ensure it's working. If there is an error, golly will retry the function indefinitely, first with a 1 second pause, then 2, 4, 8, 16 and 32s pauses until success.

This example is encapsulated in the golly.DbOpen function. So you can simplify this code to:

	db, err := golly.DbOpen("mysql", "[connection parameters]")

# Retrying

Golly catches errors and handles retries through a retry handler. This is a function of the form:

	func (err error, failureCount int, lastWait time.Duration) (time.Duration,error)

The retry handler returns the `time.Duration` that golly should wait before retrying (a negative or zero duration will cause golly to retry at once). If the retry handler doesn't want to retry, but rather to abort, return a non-nil error.

You set the retry handle with the Retry() method/function.

By default, Golly uses the `golly.RetryWithBackoff` function defined in `presets.go`. It's really simple, and does the 2, 4, 8, 16 and 32s pauses.

# Methods or Functions

Golly uses a struct to configure handlers and keep track of the failures on a function call. You can create this struct with the `golly.New()` function call. There are proxy functions in golly that automatically call golly.New() for you, so in practice you don't need golly.New() at all.

# Golly Methods / Functions

Golly has four methods:

## New() *Golly
Returns a new Golly structure. Because golly defines a function for every 'method', you should never need to use the New(). The other golly functions automatically call a `New()` for you.

## Retry(func (error,int,time.Duration) (time.Duration,error)) *Golly
Retry sets a Retry handler for the Golly struct. The retry handler returns determines whether to return an error, or retry after the returned duration has passed.

## Panic(func (interface{}) error) *Golly
Panic sets a panic handler. The panic handler can convert any panic to an error, to permit golly to do retries on panics as well as errors. By default, golly doesn't handle panics. If you don't have a panic handler, of if you throw a panic from the panic handler, golly would exit with the panic.







