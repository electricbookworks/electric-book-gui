/**
 * File models a File on the server.
 */
import {Directory} from './Directory';

export class File {
	protected _parent: Directory;
	protected _name: string;
	constructor(parent:Directory, name:string) {
		this._parent = parent;
		this._name = name;
	}
	static FromJS(parent:Directory, js:any) : File {
		return new File(parent, js.Name);
	}
	Debug() {
		console.log(this.path());
	}
	path() : string {
		let p = this._parent ? this._parent.path() : ``;
		return p + this._name;
	}
	isFile() : boolean {
		return true;
	}
	name() : string {
		return this._name;
	}
}
