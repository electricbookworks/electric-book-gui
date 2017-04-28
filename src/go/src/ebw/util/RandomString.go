package util

import (
	"crypto/rand"
	"math/big"
)

var _randomChars = `_1234567890!@#$%^&*()_+=-{}][:;><,.?/abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ`

// RandomString returns a random string of n characters.
func RandomString(n int) string {
	res := make([]byte, n)
	bigN := big.NewInt(int64(n))
	for i := 0; i < n; i++ {
		idx, err := rand.Int(rand.Reader, bigN)
		if nil != err {
			panic(err)
		}
		res[i] = _randomChars[int(idx.Int64())]
	}
	return string(res)
}
