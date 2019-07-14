package database

import (
	"github.com/craigmj/gogo"
)

var migrations = []gogo.Migration {
	// {
	// 	Apply: func(tx *gogo.Tx) {
	// 		tx.MustExecAll("")
	// 	},
	// 	Rollback: func(tx *gogo.Tx) {
	// 		tx.ExecAll("")
	// 	},
	// },
}
