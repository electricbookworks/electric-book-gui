
export enum FileState {
	// This is a file that exists on the FS, but hasn't changed
	Exists = 1,
	// A file that has been written to.
	Changed= 2,
	// A file that has been Removed, but the removal isn't yet synchronized
	Removed= 4,
	// A file that is gone - it should be removed entirely.
	Purged = 8
};
