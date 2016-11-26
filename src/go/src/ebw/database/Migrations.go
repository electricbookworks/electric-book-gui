package database

import (
	"github.com/craigmj/gogo"
)

func Migrate() error {
	return gogo.Migrate(DB(), migrations)
}

func Rollback(ver string) error {
	return gogo.Rollback(DB(), ver, migrations)
}

var migrations = []gogo.Migration{
	{
		Apply: func(tx *gogo.Tx) {
			tx.MustExecAll(`
				`)
		},
		Rollback: func(tx *gogo.Tx) {
			tx.ExecAll(``)
		},
	},
}
