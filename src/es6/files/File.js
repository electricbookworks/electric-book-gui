/**
 * File models a File on the server.
 */
class File {
	constructor(parent, name) {
		this._parent = parent;
		this._name = name;
	}
	static FromJS(parent, js) {
		return new File(parent, js.Name);
	}
	Debug() {
		console.log(this.path);
	}
	get path() {
		let p = this._parent ? this._parent.path : ``;
		return p + this._name;
	}
	get isFile() {
		return true;
	}
	get name() {
		return this._name;
	}
}
