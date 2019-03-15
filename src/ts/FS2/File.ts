import {SHA1} from './SHA1';
import {FileState, SetFileStateCSS} from './FileState';

interface WireFile {
	Version: string;
	Path: string;
	Exists: boolean,
	Data : string;
	Hash: string;
}

export class File {
	public state:FileState;

	constructor(
		public name:string, 
		public exists: boolean,
		public hash:string|undefined=undefined,
		public data:string|undefined=undefined,
		) {
		this.state = FileState.Undefined;
	}
	Serialize(): string {
		return JSON.stringify(this);
	}
	static Deserialize(js:string):File {
		let o = JSON.parse(js);
		return new File(o.name, o.exists, o.hash, o.data);
	}
	static FromWireFile(w:WireFile) : File {
		return new File(
			w.Path,
			w.Exists,
			w.Hash==`` ? undefined : w.Hash,
			w.Data==`` ? undefined : w.Data
		);
	}
	Name() : string {
		return this.name;
	}
	get path():string  { return this.name; }
	Exists() : Promise<boolean> {
		return Promise.resolve<boolean>(this.exists);
	}
	Data(): Promise<string|undefined> {
		if (!this.exists) {
			return Promise.resolve<string|undefined>(undefined);
		}
		return Promise.resolve<string|undefined>(this.data);
	}
	DataEvenIfDeleted():Promise<string|undefined> {
		return Promise.resolve<string|undefined>(this.data==undefined?'':this.data);
	}
	// It is possible to have the Hash and not the data. One might do this
	// for the HEAD FS, for eg., since we are only really interested in the
	// WD files content.
	Hash(): string|undefined {
		if (undefined==this.hash) {
			if (undefined==this.data) {
				return undefined;
			}
			this.hash = SHA1(this.data);
		}
		return this.hash;
	}
	SetState(s:FileState):void {
		this.state = s;
	}
	SetStateCSS(el:HTMLElement):void {
		if (this.state==undefined || this.state == FileState.Undefined) {
			debugger;
		}
		SetFileStateCSS(el, this.state);
	}
	SetData(d:string|undefined, hash:string|undefined=undefined):void {
		this.data = d;
		// Recalc hash
		if (undefined==d) {
			this.hash = undefined;
		} else {
			if (undefined==hash)
				this.hash = SHA1(this.data);
			else
				this.hash = hash;
		}
	}
	SetExists(e:boolean):void {
		this.exists = e;
	}
	IsDeleted():boolean {
		return this.state==FileState.Deleted;
	}
}