package git

import (
	"time"
)

type CommitSummary struct {
	When time.Time
	OID string
	Message string
}