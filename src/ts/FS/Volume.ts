import {Directory} from './Directory';
import {FileInfo,FileState} from './FileInfo';

import signals = require('signals');

export class Volume {
	protected files: Map<string,FileInfo>;
	public Events: signals.Signal;
	constructor() {
		this.files = new Map<string,FileState>();
		this.Events = new signals.Signal();
	}
	Write(path:string) {
		if (this.files.has(path)) {
			let fi = this.files.get(path);
			fi.SetState(FileState.Changed);
			return;
		}
		let fi = new FileInfo(path, FileState.Changed);
		this.files.set(path, fi);
	}
	Remove(path:string) {
		if (!this.files.has(path)) {
			return;
		}
		let fi = this.files.get(path);
		fi.SetState(FileState.Removed);
	}
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