/**
 * FileStat provides information on the status of a file
 * in a given filesystem.
 */
export enum FileStat {
	/** The file exists an is unchanged */
	Exists = 1,
	/** The file exists, and has changed */
	Changed = 2,
	/** The file is a new file */
	New = 3,
	/** The file is deleted / marked for deletion */
	Deleted = 4,
	/** The file does not exist */
	NotExist = 5
};

export function FileStatString(fs:FileStat) : string {
	switch(fs) {
		case FileStat.Exists:
			return "Exists";
		case FileStat.Changed:
			return "Changed";
		case FileStat.New:
			return "New";
		case FileStat.Deleted:
			return "Deleted";
		case FileStat.NotExist:
			return "NotExist";
	}
	debugger;
	return "-- ERROR : undefined FileStat ---";
}

export class FileContent {
	constructor(
		public readonly Name:string, 
		public readonly Stat:FileStat, 
		public readonly Content?:string,
		public Original?: FileContent) {
	}
	IsContentKnown(): boolean {
		return (undefined!=typeof this.Content);
	}
	Serialize() : string {
		return JSON.stringify(this);
	}
	static FromJS(json:string) {
		let js = JSON.parse(json);
		return new FileContent(js.Name, js.Stat, js.Content);
	}
	OriginalName() : string {
		if (this.Original) {
			return this.Original.OriginalName();
		}
		return this.Name;
	}
};


/**
 * FS is the interface implemented by all filesystems.
 */
export interface FS {
	/**
	 * Read returns the FileContent of the file, which 
	 * may, or may not, know the file's content. Hence some
	 * cache FS's might know of a file's existence, but not 
	 * have the content in-cache.
	 */
	Read(path:string) : Promise<FileContent>;
	/**
	 * Remove removes / deletes the file. The Stat of the file
	 * post Remove depends on the FS. Some FS's, such as
	 * FSRemote, will report FileStat.NotExist after Remove,
	 * while others, such as FSSession or FSOverlay, might
	 * report FileStat.Deleted, indicating that the file is known
	 * to be deleted, but that this 'deletion' hasn't yet been
	 * synced to the underlying FS.
	 *
	 * Remove takes an option FileStat parameter which is the
	 * suggested stat for the file post removal. This allows
	 * an aggregating filesystem to use a caching filesystem
	 * with a suggestion about how the caching filesystem
	 * should handle the Removal : eg. NotExist or Deleted.
	 */
	Remove(path:string,stat?:FileStat):Promise<FileContent>;
	/** 
	 * Rename renames a file, and returns the FileContent for
	 * the renamed file.
	 */
	Rename(fromPath:string,toPath:string):Promise<[FileContent,FileContent]>;
	/**
	 * Returns the RepoOwner and RepoName's provided for the
	 * filesystem.
	 */
	RepoOwnerName():[string,string];
	/**
	 * Revert is only supported on some filesystems, and 
	 * reverts the file's content to the underlying filesystem
	 * content, discarding unsaved local changes.
	 */
	Revert(path:string): Promise<FileContent>;
	/**
	 * Stat returns the stat of the given file.
	 */
	Stat(path:string) : Promise<FileStat>;
	/** 
	 * Sync is only supported on some filesystems, and 
	 * synchronizes a caching filesystem with an underlying
	 * filesystem.
	 */
	Sync(path?:string):Promise<FileContent[]>;
	/** 
	 * Write writes the file. If the content parameter is
	 * not provided, the existence of the file is marked with some
	 * FS's, but its content isn't recorded.
	 */
	Write(path:string, stat:FileStat, content?:string):Promise<FileContent>;
	/**
	 * IsDirty reports whether the given file path is 
	 * dirty. Some file systems don't support Dirty, since they
	 * are entirely commit-based, while others, such as FSOverlay,
	 * permit a sense of a Dirty file.
	 */
	IsDirty(path:string):Promise<boolean>;
}
