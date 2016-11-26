package gogo

import (
	"database/sql"
)

type PgInterface struct {
	Schema string
}

func NewPgInterface(schema string) *PgInterface {
	if "" == schema {
		schema = "gogo_migrate"
	}
	return &PgInterface{Schema: schema}
}

func (pg *PgInterface) schemaName(tbl string) string {
	if "" == pg.Schema {
		return tbl
	}
	return pg.Schema + "." + tbl
}

func (pg *PgInterface) TableExists(db *sql.DB, table string) (bool, error) {
	var tblname string
	schema := pg.Schema
	if "" == schema {
		schema = "current_schema"
	} else {
		schema = "'" + pg.Schema + "'"
	}
	res := db.QueryRow(`
	SELECT tablename
    FROM   pg_catalog.pg_tables 
    WHERE  schemaname = `+schema+`
    AND    tablename  = $1`, table)
	err := res.Scan(&tblname)

	if nil == err {
		return true, nil
	}
	if sql.ErrNoRows == err {
		return false, nil
	}
	return false, err
}

func (pg *PgInterface) InsertVersionSql(gogoTable string) string {
	return `insert into ` + pg.schemaName(gogoTable) + `(version, migration_date) values($1, current_timestamp)`
}
func (pg *PgInterface) UpdateVersionSql(gogoTable string) string {
	return `update ` + pg.schemaName(gogoTable) + ` set version = $1, migration_date=current_timestamp`
}
func (pg *PgInterface) SelectVersionSql(gogoTable string) string {
	return `select version from ` + pg.schemaName(gogoTable)
}

func (pg *PgInterface) CreateGogoTableSql(gogoTable string) string {
	sql := `
			create table ` + pg.schemaName(gogoTable) + `
			(
				version int not null default 0,
				migration_date timestamp not null, 
				primary key(version)
			)`
	return sql
}

func (pg *PgInterface) PreMigrate(db *sql.DB) error {
	var err error
	if "" != pg.Schema {
		_, err = db.Exec(`create schema if not exists ` + pg.Schema)
	}
	return err
}

func (*PgInterface) PostMigrate(db *sql.DB) error {
	return nil
}
