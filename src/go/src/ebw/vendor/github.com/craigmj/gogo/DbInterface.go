package gogo

import (
	"database/sql"
)

type DbInterface interface {
	CreateGogoTableSql(gogoTable string) string
	InsertVersionSql(gogoTable string) string
	UpdateVersionSql(gogoTable string) string
	SelectVersionSql(gogoTable string) string
	PostMigrate(db *sql.DB) error
	PreMigrate(db *sql.DB) error
	TableExists(db *sql.DB, table string) (bool, error)
}

var dbi DbInterface

func init() {
	dbi = &MysqlInterface{}
}

// SetDbInterface allows setting to a db interface for a particular
// database. By default Gogo uses the MysqlInterface, but if you are
// using a different database, you can either use a gogo provided
// database interface, or writ eyour own.
func SetInterface(d DbInterface) {
	dbi = d
}
