package gogo

import (
	"database/sql"
)

type MysqlInterface struct{}

func (*MysqlInterface) InsertVersionSql(gogoTable string) string {
	return `insert into ` + gogoTable + `(version, migration_date) values(?, now())`
}
func (*MysqlInterface) UpdateVersionSql(gogoTable string) string {
	return `update ` + gogoTable + ` set version = ?, migration_date=now()`
}
func (MysqlInterface) SelectVersionSql(gogoTable string) string {
	return `select version from ` + gogoTable
}

func (m *MysqlInterface) TableExists(db *sql.DB, table string) (bool, error) {
	var tblname string
	res := db.QueryRow(`show tables like '` + table + `'`)
	err := res.Scan(&tblname)
	if nil == err {
		return true, nil
	}
	if sql.ErrNoRows == err {
		return false, nil
	}
	return false, err
}

func (m *MysqlInterface) CreateGogoTableSql(gogoTable string) string {
	return `
			create table if not exists ` + gogoTable + `
			(
				version int not null default 0,
				migration_date datetime not null, 
				primary key(version)
			)`
}

func (m *MysqlInterface) PreMigrate(db *sql.DB) error {
	_, err := db.Exec(`set autocommit=0`)
	return err
}

func (m *MysqlInterface) PostMigrate(db *sql.DB) error {
	_, err := db.Exec(`set autocommit=1`)
	return err
}
