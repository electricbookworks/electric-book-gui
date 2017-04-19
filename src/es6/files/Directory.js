/**
 * Directory models a directory on the server. It needs to know
 * its own directory name, and the link to its parent so that it
 * can construct its full name on the parent.
 */
class Directory {
	constructor(parent, name) {
		this._parent = parent;
		this._name = name;
		this.Files = [];
	}
	static FromJS(parent, js) {
		let d = new Directory(parent, js.Name);
		for (let f of js.Files) {
			let e = null;
			if (f.Dir) {
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
		console.log(this.path);
		for (let f of this.Files) {
			f.Debug();
		}
	}
	get path() {
		if (this._parent) {
			return this._parent.path + this.name + '/';
		}
		return '';
	}
	get name() {
		return this._name;
	}
	get isFile() {
		return false;
	}
	*FileNamesOnly() {
		for (let f of this.Files) {
			if (!f.isFile) {
				yield* f.FileNamesOnly();
			} else {
				yield f.path;
			}
		}
	}
}