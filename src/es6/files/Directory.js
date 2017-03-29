class FileType {
	constructor(parent,name) {
		this._parent = parent;
		this._name = name;
	}
	get name() {
		return this._name;
	}
}

class File extends FileType {
	constructor(parent, name) {
		super(parent,name)
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
}

/**
 * Directory models a directory on the server. It needs to know
 * its own directory name, and the link to its parent so that it
 * can construct its full name on the parent.
 */
class Directory extends FileType {
	constructor(parent, name) {
		super(parent,name);
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
}