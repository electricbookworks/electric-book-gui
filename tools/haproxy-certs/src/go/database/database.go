package database

import (
	_ "github.com/go-sql-driver/mysql"
	_ "github.com/jinzhu/gorm/dialects/mysql"

	"github.com/sirupsen/logrus"
	"github.com/craigmj/golly"
	"github.com/craigmj/golly/gollygorm"
	"github.com/craigmj/gogo"
	"github.com/juju/errors"
	"github.com/jinzhu/gorm"

	"haproxy-certs/model"
)

var db *gorm.DB
var log = logrus.New()

/**
 * Connect opens and returns a database connection, but does not do database
 * migration. This _is not_ thread safe, so don't use it on more than one 
 * control path.
 */
func Connect(conn string, f func(*gorm.DB) error) error {
	var err error
	if ""==conn {
		return f(nil)
	}
	golly.ErrorLog = func(err error) { log.Error(err) }
	db, err = gollygorm.DbOpen("mysql", conn)
	if nil!=err {
		return errors.Trace(err)
	}
	defer func() {
		db.Close()
		db = nil
	}()
	if err = f(db); nil!=err {
		return err
	}
	return nil
}

/**
 * Connect and migrate connects to the database, and migrates the database
 * rollback and returns without calling the function)
 */
func ConnectAndMigrate(conn string, f func(*gorm.DB) error) error {
	return Connect(conn, func (db *gorm.DB) error {
		if err := model.Migrate(db); nil!=err {
			return err
		}
		
		if nil!=db {
			if err := gogo.Migrate(db.DB(), migrations); nil!=err {
				return errors.Trace(err)
			}
		}
		return f(db)
	})
}

/**
 * Rollback rolls the database back to the given version
 */
func Rollback(conn string, version string) error {
	return Connect(conn, func(db *gorm.DB) error {
		
		return gogo.Rollback(db.DB(), version, migrations)
	})
}

/**
 * Tx wraps a transaction so that we can track committing, and ensure that we
 * don't rollback a committed transaction, which causes and ignorable yet annoying error.
 */
type Tx struct {
	*gorm.DB
	committed bool
}

func (t *Tx) Commit() error {
	if err := t.DB.Commit().Error; nil!=err {
		return errors.Trace(err)
	}
	t.committed = true
	return nil
}

func (t *Tx) Rollback() error {
	if t.committed {
		// this is ok- transaction has been committed
		return nil
	}
	if err := t.DB.Rollback().Error; nil!=err {
		return errors.Trace(err)
	}
	return nil
}

// Transact supplies a function with a Transaction that will auto-rollback
// or auto-commit depending whether the function returns an error or not, respectively.
func Transact(f func(tx *Tx) error) error {
	if nil==db {
		log.Warnf("No database connected - Transacting without db")
		return f(nil)
	}
	tx := &Tx{
		db.Begin(),
		false,
	}
	if nil!=tx.DB.Error {
		return errors.Trace(tx.DB.Error)
	}
	defer func() {
		if err := tx.Rollback(); nil!=err {
			log.Error(err)
		}
	}()
	if err := f(tx); nil!=err {
		return err
	}
	return tx.Commit()
}

