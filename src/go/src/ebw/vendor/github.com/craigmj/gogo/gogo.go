package gogo

import (
	"database/sql"
	"fmt"
	"log"
	"reflect"
	"strconv"
)

var db *sql.DB
var gogoTable = "_gogo_migrations"

// A Migration is a one-way advancement of the database.
type Migration struct {
	Apply    func(*Tx)
	Rollback func(*Tx)
}

// MetaTable lets you set the name of the table where gogomigrate should
// store its information about the current db version. The default is _gogo_migrations
func MetaTable(table string) {
	gogoTable = table
}

// Version returns the current version of the database.
// Your migrations are numbered from 1, so a version of 0 means that no
// migrations have been applied.
func Version(db *sql.DB) (int, error) {
	var version int

	hasGogoTable, err := dbi.TableExists(db, gogoTable)
	if nil != err {
		return 0, err
	}
	if !hasGogoTable {
		_, err = db.Exec(dbi.CreateGogoTableSql(gogoTable))
		if nil != err {
			return -1, fmt.Errorf("Creating gogomigration versioning table %v: %v", gogoTable, err.Error())
		}
		version = 0
	}
	res := db.QueryRow(dbi.SelectVersionSql(gogoTable))
	err = res.Scan(&version)
	if sql.ErrNoRows == err {

		_, err = db.Exec(dbi.InsertVersionSql(gogoTable), 0)
		if nil != err {
			return -1, fmt.Errorf("Inserting 0 version into %v: %v", gogoTable, err.Error())
		}
		return version, nil
	}
	if nil != err {
		return -1, fmt.Errorf("Scanning version from %v: %v", gogoTable, err.Error())
	}

	return version, nil
}

// Apply migrates the database to the latest migration version
func Migrate(db *sql.DB, migrations []Migration) (err error) {
	err = dbi.PreMigrate(db)
	if nil != err {
		return err
	}
	defer dbi.PostMigrate(db)

	version, err := Version(db)
	if nil != err {
		return err
	}

	// safeExec applies the migration, and returns an error if the migration returns
	// an error, or if the migration panics
	safeExec := func(tx *sql.Tx, f func(*Tx)) (err error) {
		defer func() {
			if e := recover(); e != nil {
				ok := true
				err, ok = e.(error)
				if !ok {
					err = fmt.Errorf("Unexpected panic value of type %v: %v", reflect.TypeOf(e).Name(), e)
				}
			}
		}()
		f(&Tx{tx})
		return nil
	}

	onError := func(tx *sql.Tx, ver int, err error) error {
		log.Println("onError ", err, " : on ver=", ver)
		if err := safeExec(tx, migrations[ver].Rollback); nil != err {
			log.Println("ERROR during migration.Rollback: ", err)
		}
		if err := tx.Rollback(); nil != err {
			log.Println("ERROR during transaction rollback: ", err)
		}
		return fmt.Errorf("Migrating to version %v: %v", version+1, err.Error())
	}
	for version < len(migrations) {
		tx, err := db.Begin()
		if nil != err {
			return fmt.Errorf("Starting transaction: %v", err.Error())
		}
		if err := safeExec(tx, migrations[version].Apply); nil != err {
			return onError(tx, version, err)
		}
		version++
		_, err = tx.Exec(dbi.UpdateVersionSql(gogoTable), version)
		if nil != err {
			return onError(tx, version, fmt.Errorf("Updating version table for version %v: %s", version, err.Error()))
		}
		err = tx.Commit()
		if nil != err {
			return onError(tx, version, fmt.Errorf("Committing transaction for migration %v: %v", version+1, err.Error()))
		}
	}
	return nil
}

// Rollback rolls the database back to the destination version. Versions are
// numbered from 1, so a Rollback to 0 would rollback all migrations.
func Rollback(db *sql.DB, destinationVersionString string, migrations []Migration) (err error) {
	if "" == destinationVersionString {
		return nil
	}
	destinationVersion, err := strconv.Atoi(destinationVersionString)
	if nil != err {
		return err
	}

	if err = dbi.PreMigrate(db); nil != err {
		return err
	}
	defer dbi.PostMigrate(db)

	version, err := Version(db)
	if nil != err {
		return err
	}

	// Negative destinationVersions mean we rollback by a delta
	if 0 > destinationVersion {
		destinationVersion = version + destinationVersion
		if 0 > destinationVersion {
			return fmt.Errorf("Cannot rollback to negative version %d from current version %d", destinationVersion, version)
		}
	}

	log.Println("Rollback to version ", destinationVersion)
	// safeRollback rollsback the migration, and returns an error if the migration rollback returns
	// an error, or if the migration rollback panics
	safeRollback := func(tx *sql.Tx, migration Migration) (err error) {
		defer func() {
			if e := recover(); e != nil {
				ok := true
				err, ok = e.(error)
				if !ok {
					err = fmt.Errorf("Unexpected panic value of type %v: %v", reflect.TypeOf(e).Name(), e)
				}
			}
		}()
		migration.Rollback(&Tx{tx})
		return nil
	}

	if 1 > version {
		if version == destinationVersion {
			return nil
		}
		return fmt.Errorf("Cannot rollback: currently at version %v", version)
	}

	for version > destinationVersion {
		log.Println("Rolling back from version", version)
		version--
		Tx, err := db.Begin()
		if nil != err {
			return fmt.Errorf("Starting transaction: %v", err.Error())
		}
		if err := safeRollback(Tx, migrations[version]); nil != err {
			Tx.Rollback()
			return fmt.Errorf("Rollingback version %v: %v", version+1, err.Error())
		}
		_, err = Tx.Exec(dbi.UpdateVersionSql(gogoTable), version)
		if nil != err {
			Tx.Rollback()
			return fmt.Errorf("Updating version to %v: %v", version+1, err.Error())
		}
		err = Tx.Commit()
		if nil != err {
			Tx.Rollback()
			return fmt.Errorf("Committing transaction for rollback %v: %v", version+1, err.Error())
		}
	}
	return nil
}
