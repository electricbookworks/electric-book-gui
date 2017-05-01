import {Directory} from './Directory';
import {FileInfo} from './FileInfo';
import {FileState} from './FileState';

import signals = require('signals');

export class Volume {
	protected files: Map<string,FileInfo>;
	public Events: signals.Signal;
	constructor() {
		this.files = new Map<string,FileState>();
		this.Events = new signals.Signal();
	}
	// Get returns the FileInfo for the file at the 
	// named path, or undefined if there is no such
	// file at the named path.
	// To create a file, use Write.
	Get(path:string) : FileInfo|undefined {
		let f= files.get(path);
		if (f) {
			return f;
		}
		return undefined;
	}
	// Write creates a file at the named path, or updates
	// the files state to FileState.Changed if the file
	// already exists.
	Write(path:string) {
		if (this.files.has(path)) {
			let fi = this.files.get(path);
			fi.SetState(FileState.Changed);
			return;
		}
		let fi = new FileInfo(path, FileState.Changed);
		this.files.set(path, fi);
	}
	// Remove sets the state of the file at the given
	// path to FileState.Removed
	Remove(path:string) {
		if (!this.files.has(path)) {
			return;
		}
		let fi = this.files.get(path);
		fi.SetState(FileState.Removed);
	}
	// Purge purges the file at the given path. Unlike
	// Remove, which simply marks a file as 'deleted',
	// Purge actually removes the file entirely, including
	// removing the record that we have of the file.
	Purge(path:string) {
		let f = this.files.get(path);
		if (f) {
			f.SetState(FileState.Purged);
			this.files.delete(path);
		}
	}
	// FromJS adds files to the Volume from the Directory
	// and File objects serialized in the given js object.
	FromJS(js : any) {
		let d = Directory.FromJS(undefined, js);
		this.files = new Map<string,FileState>();
		let filter = function(n:string):boolean {
			if ("."==n.substr(0,1)) {
				return false;
			}
			if ("_output" == n.substr(0,7)) {
				return false;
			}
			if ("_html"==n.substr(0,5)) {
				return false;
			}
			return true;
		}
		for (let f of d.FileNamesOnly(filter)) {
			let fi = new FileInfo(f, FileState.Exists);
			this.files.set(f, fi);
			this.Events.dispatch(this, fi);
		}
	}
}