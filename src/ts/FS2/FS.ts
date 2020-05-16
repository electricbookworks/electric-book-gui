import {Context} from '../Context';
import {File} from './File';
import {FileState} from './FileState';

/**
 * An FS is the most basic idea of a FileSystem - you can Write, Remove or Read by a key (the path).
 * Most of the power of the FS comes from its relationship with its parent.
 */
export interface FS {
	Name():string;
	Parent(name:string):FS|null;

	FileState(path:string):Promise<FileState>;
	Read(path:string):Promise<File>;
	Remove(f:File):Promise<File>;
	Revert(path:string):Promise<File>;
	Sync(path:string|null):Promise<File>;
	Move(from:string,to:string):Promise<File>;
	Write(f:File, data:string):Promise<File>;

}

export class FSStateAndPath {
	constructor(public path:String, public state:FileState) {}
	ShouldSync():boolean {
		return !(
			    this.state == FileState.Absent || 
				this.state == FileState.Unchanged ||
				this.state == FileState.Undefined);
	}
}

/**
 * Base class implementation of a File System.
 */
export abstract class FSImpl {
	constructor(protected parent:FS|null) {
	}

	abstract Read(path:string):Promise<File>;
	abstract Remove(fc:File):Promise<File>;
	abstract Write(path:string, data:string):Promise<File>;
	Move(from:string, to:string):Promise<File> {
		return this.Read(to)
		.then(
			(f:File)=>{
				if (from==to) {
					return Promise.resolve<File>(f);
				}
				if (f.exists) {
					console.log(`FOUND ${to}: `, f);
					return Promise.reject(`The destination file ${to} already exists.`);
				}
				return this.Read(from)
				.then((f:File)=>f.Data())
				.then((raw:string)=>this.Write(to,raw))
				.then((f:File)=>{
					return this.Remove(from)
					.then((_:File)=>{
						return Promise.resolve<File>(f);
					});
				});
			});
	}
	Set(f:File):Promise<File> {
		return f.Exists()
		.then(
			(exists:boolean)=>{
				if (exists) {
					return f.Data()
					.then(
						(raw:string)=> this.Write(f.Name(), raw)
						);
				} else {
					return this.Remove(f.Name());
				}
			});
	}
	Revert(path:string):Promise<File> {
		if (null==this.Parent()) {
			return Promise.reject<File>(`Cannot revert on a FS without a parent FS`);
		}
		console.log(`FSImpl.Revert : this.Parent().Name() = ${this.Parent().Name()}`);
		return this.Parent().Read(path)
		.then( (f:File)=>this.Set(f) );
	}

	/**
	 * Parent filesystem, or the parent filesystem with the given
	 * name.
	 */
	Parent(name:string=``) : FS|null {
		if (null==this.parent) {
			return null;
		}
		if ((``==name) || (name==this.parent.Name())) {
			return this.parent;
		}
		return this.parent.Parent(name);
	}
	/**
	 * Synchronize the filesystem with the FS below it.
	 * So a Mem FS might synchronize with WorkingFS, or 
	 * WorkingFS might sync with HEAD (which is a commit).
	 */
	abstract Sync(path:string|null): Promise<File>;

	/**
	 * Return the File System's name. Each FS identifies itself uniquely by a name, eg 'Mem','HEAD',
	 * 'WorkingDir', even perhaps 'Origin'.
	 */
	abstract Name(): string;

	/**
	 * setState sets the state of a File and returns a Promise with
	 * the File with its state set.
	 */
	protected setState(f:File):Promise<File>{
		return this.FileState(f.Name())
		.then(
			(fs:FileState)=>{				
				f.state = fs;
				return Promise.resolve<File>(f);
			});
	}

	/**
	 * FileState returns the state of a file between this FS and this FS's parent.
	 */
	FileState(path:string):Promise<FileState> {
		if (!this.Parent()) {
			return Promise.resolve<FileState>(FileState.Undefined);
		}
		return Promise.all([this.Read(path), this.Parent().Read(path)])
		.then(
			([top, bottom]: [File,File])=>{
				// console.log(`FileState ${path} : top.hash=${top.hash}, bottom.hash=${bottom.hash}`);
				let fs:FileState = FileState.Unchanged;
				if (top.exists && !bottom.exists) {
					fs =  FileState.New;
				} else if ((!top.exists) && bottom.exists) {
					fs =  FileState.Deleted;
				} else if (!(top.exists || bottom.exists)) {
					fs = FileState.Absent;
				} else if (top.Hash() != bottom.Hash()) {
					fs = FileState.Changed;
				}
				return Promise.resolve<FileState>(fs);
			});
	}

	/**
     * FileStateAndPath returns the FSStateAndPath object for the 
     * given path. This is useful when working with functional classes.
     */
	FileStateAndPath(path:string):Promise<FSStateAndPath> {
		return this.FileState(path)
		.then(
			(fs:FileState)=>Promise.resolve<FSStateAndPath>(new FSStateAndPath(path,fs))
		);
	}
}
