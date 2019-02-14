/**
 * FileState provides information on the status of a file
 * in a given filesystem vis-a-vis its parent
 * filesystem.
 */
export enum FileState {
	New = 1,
	Deleted = 2,
	Absent = 3,	// Absent = NOT EXISTS IN EITHER FILESYSTEM
	Changed = 4,
	Unchanged = 5,
	Undefined = 6	// Typically if there is not parent FS
};

export function SetFileStateCSS(el:HTMLElement, fs:FileState) : void {
	// console.log(`SetFileStateCSS = el=`, el, `, fs=`, FileStateString(fs));
	if (fs==undefined || fs==FileState.Undefined) {
		console.log(`in SetFileStateCSS: fs=`, fs);
	}
	for (let s of [FileState.New, FileState.Deleted, FileState.Absent, FileState.Changed, FileState.Unchanged]) {
		let c = 'state-' + FileStateString(s);
		el.classList.remove(c);
		if (fs==s) {
			el.classList.add(c)
		}
	}
}

export function FileStateString(fs:FileState) : string {
	switch (fs) {
		case FileState.New: return "new";
		case FileState.Deleted: return "deleted";
		case FileState.Absent: return "absent";
		case FileState.Changed: return "changed";
		case FileState.Unchanged: return "unchanged";
		case FileState.Undefined: return "--UNDEFINED--";
	}
	return "UNKNOWN STATE: fs = ${fs}"
}