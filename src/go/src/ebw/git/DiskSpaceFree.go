package git

import "syscall"
import "os"

func DiskSpaceFree() (uint64, error) {
	var stat syscall.Statfs_t

	wd, err := os.Getwd()
	if nil != err {
		return 0, err
	}

	syscall.Statfs(wd, &stat)

	// Available blocks * size per block = available space in bytes
	return stat.Bavail * uint64(stat.Bsize), nil
}
