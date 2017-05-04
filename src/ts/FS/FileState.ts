
export enum FileState {
	// This is a file that exists on the FS, 
	// but hasn't changed.
	Exists = 1,
	// Same as Exists
	Synced = 1,
	// A file that has been changed, but not
	// not 'Synced'.
	Changed= 2,
	// A New file, much like Changed, but doesn't
	// exist in the underlying system
	New = 4,
	// A deleted file that hasn't yet been synced.
	Deleted = 8,
	// A file that doesn't exist at all. A deleted
	// file once Sync'd becomes NotExist
	NotExist = 16
};
