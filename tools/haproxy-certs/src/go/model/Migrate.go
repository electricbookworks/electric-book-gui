package model

import (
	"github.com/jinzhu/gorm"
	"github.com/juju/errors"
)

func Migrate(db *gorm.DB) error {
	if db.AutoMigrate(
		// &ModelType{},
	).Error!=nil {
		return errors.Trace(db.Error)
	}
	return nil
}
