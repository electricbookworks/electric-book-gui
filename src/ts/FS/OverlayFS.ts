import {FileInfo} from './FileInfo';
import {BaseFS} from './BaseFS';

enum ChangeType {
	WRITE = 1,
	REMOVE
}

class ChangeTracker {
	protected changes:Map<string,ChangeType>;
	constructor() {
		this.changes = new Map<string,ChangeType>();
	}
	Write(path:string) {
		this.changes.set(path, ChangeType.WRITE);
	}
	Remove(path:string) {
		this.changes.set(path, ChangeType.REMOVE);
	}
	Sync(path:string) {
		this.changes.delete(path);
	}
}

/**
 * OverlayFS overlays one filesystem on top of another,
 * and tracks files that have changed in the 'top' filesystem.
 * When 'Sync' is called, the copies from the top filesystem
 * are copied to the 'bottom' filesystem.
 * We _assume_ that the top FS is faster than the bottom 
 * FS, so even if a file is not dirty, we first check the 
 * top FS to see whether it can supply file information.
 */
export class OverlayFS extends BaseFS {
	protected _name: string;
	protected _dirty: Set<string>;
	/** name is the name of the filesystem. */
    constructor(name: string, 
    	protected top: BaseFS, 
    	protected bottom: BaseFS) {
    	super(`overlay:${name}`);
        this._dirty = new Set<string>();
    }
    SetDirty(path:string) : void {
        this._dirty.add(path);
    }
    ClearDirty(path:string): void {
        this._dirty.delete(path);
    }
    IsDirty(path?:string) : boolean {
    	if (path) {
    		return this._dirty.has(path);
    	}
    	return 0<this._dirty.size;
    }
    Dirty() : Iterator {
    	return this._dirty[Symbol.iterator]();
    }

    Exists(path:string):Promise<boolean> {
    	if (this.IsDirty(path)) {
    		return this.top.Exists(path);
    	} else {
    		return new Promise( (resolve,reject)=>{
    			this.top.Exists(path)
    			.then(
    				(exists)=>{
    					if (exists) {
    						return Promise.resolve(true);
    					}
    					return this.bottom.Exists(path);
    				})
    			.then(resolve)
    			.catch(reject);
    		});
    	}
    }
    ListAll():Promise<string[]>{
    	return this.bottom.ListAll();
    }
	Read(path:string):Promise<string|undefined> {
		if (IsDirty(path)) {
			return this.top.Read(path);
		} else {
			return new Promise<string|undefined>((resolve,reject)=>{
				this.top.Read(path)
				.then(
					(content:string|undefined)=>{
						if (undefined!=typeof content) {
							return Promise.resolve(content);
						}
						return this.bottom.Read(path);
					})
				.then(resolve)
				.catch(reject);
			});
		}
	}
    Write(path:string,content:string):Promise<void> {
    	return new Promise<void>( (resolve,reject)=>{
    		this.top.Write(path,content)
    		.then(
    			()=>{
    				this.SetDirty(path);
    				resolve();
    			}
    		).catch(reject);
    	});
    }
    Remove(path:string):Promise<void> {
    	return new Promise<void>( (resolve,reject)=>{
    		this.top.Remove(path)
    		.then(
    			()=>{
    				this.SetDirty(path);
    				resolve;
    			})
    		.catch(reject);
    	});
    }
    Sync(cb: (msg:string)=>void) : Promise<void> {
   		let promises:Promise<void>[] = new Array<Promise<void>>();
    	this._dirty.forEach( (path)=>{
    		let p:Promise<void> = new Promise( (resolve,reject)=>{
	    		this.top.Read(path)
	    		.then(
    				(content)=>{
    					let res = ()=>{
    						this.ClearDirty(path);
    						resolve();
    					};
    					if (undefined==typeof content) {
    						this.bottom.Remove(path)
    						.then(res)
    						.catch(reject);
    					} else {
    						this.bottom.Write(path,content)
    						.then(res).catch(reject);
    					}
    				})
	    		.catch(reject);
	    	});
	    	promises.push(p);
    	});
    	return Promise.all(promises);
    }
}
