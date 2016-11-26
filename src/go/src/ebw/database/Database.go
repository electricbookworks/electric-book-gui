package database

import (
	"database/sql"

	"github.com/craigmj/golly"
	"github.com/golang/glog"
	"github.com/prometheus/client_golang/prometheus"
)

// type Tx interface {
// 	Exec(query string, args ...interface{}) (sql.Result, error)
// 	Prepare(query string) (*sql.Stmt, error)
// 	Query(query string, args ...interface{}) (*sql.Rows, error)
// 	QueryRow(query string, args ...interface{}) *sql.Row
// }

var (
	db                    *sql.DB
	metricOpenConnections = prometheus.NewGauge(prometheus.GaugeOpts{
		Namespace: "database",
		Subsystem: "mysql",
		Name:      "open_connections",
		Help:      "Number of open database connections",
	})
)

func Open(conn string) error {
	var err error
	golly.ErrorLog = func(err error) {
		if nil != err {
			glog.Error(err)
		}
	}
	db, err = golly.DbOpen("mysql", conn)
	return err
}

func Close() error {
	return db.Close()
}

func DB() *sql.DB {
	return db
}

// Tx runs the given function within a transaction, rolling back if any error is encountered
func Tx(trans func(*sql.Tx) error) error {
	tx, err := DB().Begin()
	if nil != err {
		return err
	}
	defer tx.Rollback()
	metricOpenConnections.Set(float64(db.Stats().OpenConnections))
	if err = trans(tx); nil != err {
		return err
	}
	return tx.Commit()
}
