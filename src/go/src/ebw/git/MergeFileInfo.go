package git

import (
	"fmt"
)

type MergeFileInfo struct {
	Working *FileInfo
	Their   *FileInfo
	Index   *FileInfo
}

func (mf *MergeFileInfo) String() string {
	return fmt.Sprintf("%s:\n\twork\t%s\n\ttheir\t%s\n\tindex\t%s\n",
		mf.Working.Path, mf.Working.Hash, mf.Their.Hash, mf.Index.Hash)
}
