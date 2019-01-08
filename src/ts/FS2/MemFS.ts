import {File} from './File';
import {FS, FSImpl} from './FS';

/**
 * The Memory-based filesystem on this browser right now.
 * Not yet synced to the lower FS.
 */
export class MemFS extends FSImpl {
	cache: Map<string,File>;
	constructor(protected key:string, parent: FS) {
		super(parent);
		this.cache = new Map<string,File>();
	}
	protected getCache(path:string) : File|undefined {
		if (this.cache.has(path)) {
			// let f = this.cache.get(path);
			// return f;
			return this.cache.get(path);
		}
		return undefined;
	}
	protected setCache(f:File) : void {
		this.cache.set(f.name, f);
	}
	protected clearCache(path:string|File) : void {
		if (typeof path == 'string') {
			this.cache.delete(path);			
		} else {
			this.cache.delete(path.name);
		}
	}
	Name(): string { return "mem"; }
	Read(path:string):Promise<File>{
		let f = this.getCache(path);
		if (undefined!=f) {
			return Promise.resolve(f);
		}
		if (null==this.parent) {
			/* TODO: Should this return a 'FileNotExists' file? */
			return Promise.resolve(undefined);
		}
		return this.parent
		.Read(path)
		.then (
			(f:File)=>{
				this.setCache(f);
				return this.setState(f);
			});
	}
	Write(path:string, data:string):Promise<File> {
		return this.setState(new File(path, true, undefined, data))
		.then(
			(f:File)=>{
				this.setCache(f);
				return this.setState(f);
			});
	}
	Remove(path:string):Promise<File> {
		return this.Read(path)
		.then(
			(f:File)=>{
				f.exists = false;
				this.setCache(f);
				return this.setState(f);
			});
	}
	// Revert(path:string):Promise<File> {
	// 	// Use the FSImpl implementation of Revert, which will
	// 	// read from Parent and write to us.
	// 	return this.super.Revert(path)
	// 	.then(
	// 		(f:File)=>{
	// 			this.setCache(f);
	// 			return this.setState(f);
	// 		});
	// }
	Sync(path:string):Promise<File> {
		let f = this.getCache(path);
		if (undefined==f) {
			return Promise.reject(`Cannot sync file ${path} that doesn't exist in FileSystem`);
		}
		if (undefined==this.parent) {
			return Promise.reject(`Cannot sync on a FileSystem that doesn't have a parent`);
		}
		if (f.Exists()) {
			return f.Data().then(
				(data:string)=>{
					return this.parent.Write(path,data);
				});
		}
		return this.parent.Remove(path)
		.then(
			(_:File)=>this.setState(f)
			);
	}
}

