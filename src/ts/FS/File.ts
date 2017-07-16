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
		return new File(parent, js.N);
	}
	Debug() {
		console.log(this.Path());
	}
	Path() : string {
		let p = this._parent ? this._parent.Path() : ``;
		return p + this._name;
	}
	IsFile() : boolean {
		return true;
	}
	Name() : string {
		return this._name;
	}
}
