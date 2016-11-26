package golly

import (
	"math"
	"time"
)

// RetryWithBackoff is the default retry handler for golly. The default
// handler will retry indefinitely, with backoff waits between attempts
// of 1, 2, 4, 8, 16 and ultimately 32s.
func RetryWithBackoff(err error, n int, t time.Duration) (time.Duration, error) {
	// n is number of errors, so n>=1
	// 2^5 = 32, so max backoff is 32 s
	return time.Second * time.Duration(math.Pow(2, math.Min(float64(n-1), 5))), nil
}
