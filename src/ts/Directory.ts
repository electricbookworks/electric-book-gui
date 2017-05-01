// import {File} from './File';

// /**
//  * Directory models a directory on the server. It needs to know
//  * its own directory name, and the link to its parent so that it
//  * can construct its full name on the parent.
//  */
// export class Directory {
// 	protected _parent: Directory|undefined;
// 	protected _name: string;
// 	protected Files: Array<Directory|File>;
	
// 	constructor(parent:Directory|undefined, name:string) {
// 		this._parent = parent;
// 		this._name = name;
// 		this.Files = [];
// 	}
// 	static FromJS(parent:Directory|undefined, js:any) : Directory {
// 		let d = new Directory(parent, js.Name as string);
// 		for (let f of js.Files) {
// 			let e : Directory|File;
// 			if (f.Dir) {
// 				e = Directory.FromJS(d, f);
// 				d.Files.push(e);
// 			} else {
// 				e = File.FromJS(d, f);
// 				d.Files.push(e);
// 			}
// 		}
// 		return d;
// 	}
// 	Debug() {
// 		console.log(this.path);
// 		for (let f of this.Files) {
// 			f.Debug();
// 		}
// 	}
// 	path():string {
// 		if (this._parent) {
// 			return this._parent.path + this._name + '/';
// 		}
// 		return '';
// 	}
// 	name():string {
// 		return this._name;
// 	}
// 	isFile():boolean {
// 		return false;
// 	}
// 	*FileNamesOnly() {
// 		for (let f of this.Files) {
// 			if (!f.isFile()) {
// 				yield* (f as Directory).FileNamesOnly();
// 			} else {
// 				yield f.path();
// 			}
// 		}
// 	}
// }