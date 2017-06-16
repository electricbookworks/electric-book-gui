package git

import (
	"encoding/json"
	"fmt"
)

type MergeFileResolutionState int

const (
	MergeFileResolved = 1
	MergeFileModified = 2
	MergeFileNew      = 3
	MergeFileDeleted  = 4
)

func (m *MergeFileResolutionState) MarshalJSON() ([]byte, error) {
	return json.Marshal(map[string]interface{}{
		`State`:       int(*m),
		`Description`: m.String(),
	})
}

func (m MergeFileResolutionState) String() string {
	switch m {
	case MergeFileDeleted:
		return `deleted`
	case MergeFileModified:
		return `modified`
	case MergeFileNew:
		return `new`
	case MergeFileResolved:
		return `resolved`
	}
	return fmt.Sprintf(`ERROR MergeFileResolutionState %d undefined`, m)
}
