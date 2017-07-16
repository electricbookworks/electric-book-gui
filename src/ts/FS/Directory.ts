import {File} from './File';

/**
 * Directory models a directory on the server. It needs to know
 * its own directory name, and the link to its parent so that it
 * can construct its full name on the parent.
 */
export class Directory {
	protected _parent: Directory|undefined;
	protected _name: string;
	protected Files: Array<Directory|File>;
	
	constructor(parent:Directory|undefined, name:string) {
		this._parent = parent;
		this._name = name;
		this.Files = [];
	}
	static FromJS(parent:Directory|undefined, js:any) : Directory {
		let d = new Directory(parent, js.N as string);
		for (let f of js.F) {
			let e : Directory|File;
			if (f.F) {
				e = Directory.FromJS(d, f);
				d.Files.push(e);
			} else {
				e = File.FromJS(d, f);
				d.Files.push(e);
			}
		}
		return d;
	}
	Debug() {
		console.log(this.Path());
		for (let f of this.Files) {
			f.Debug();
		}
	}
	Path():string {
		if (this._parent) {
			return this._parent.Path() + this._name + '/';
		}
		return '';
	}
	Name():string {
		return this._name;
	}
	IsFile():boolean {
		return false;
	}
	FileNamesOnly(filter?:(n:string)=>boolean) : string[] {
		let fs: string[] = [];
		for (let f of this.Files) {
			if (f.IsFile()) {
				let p = f.Path();
				if (!filter || filter(p)) {
					fs.push(p);
				}
			} else {
				fs = fs.concat((f as Directory).FileNamesOnly(filter));
			}
		}
		return fs.sort();
	}
}