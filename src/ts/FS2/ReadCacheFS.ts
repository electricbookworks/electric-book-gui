import {File} from './File';
import {FS, FSImpl} from './FS';

// ReadCacheFS is a read-only cache between an underlying FS and a session based
// cache. All Writes, Syncs, etc are passed transparently through. For all intents and
// purposes - except caching - it is transparent.
export class ReadCacheFS extends FSImpl {
	static MaxCacheSize:number = 200000;
	constructor(protected key:String, parent: FS) {
		super(parent);
	}
	cacheKey(path:string):string {
		return `${this.key}:${path}`;
	}
	clearCache(path) : void {
		sessionStorage.removeItem(this.cacheKey(path));
	}
	setCache(f:File) : Promise<File> {
		let data = f.Serialize();
		try {
			if (data.length<=ReadCacheFS.MaxCacheSize) {
				sessionStorage.setItem(this.cacheKey(f.Name()), data);
			} else {
				//console.log(`ReadCacheFS won't cache ${f.Name()} : MaxCacheSize ${ReadCacheFS.MaxCacheSize} < length = ${data.length}`);
			}
		} catch (e) {
			if (`QuotaExceededError`==e.name) {
				// we just ignore this error, but we don't crash on it either
			} else {
				EBW.Error(err);
			}
		}
		return Promise.resolve<File>(f);
	}
	getCache(path) : File|undefined {
		let js = sessionStorage.getItem(this.cacheKey(path));
		if (null==js) {
			return undefined;
		}
		return File.Deserialize(js);
	}
	Name():string { return this.parent.Name(); }
	Read(path:string):Promise<File|undefined> {
		// console.log(`ReadCacheFS::Read(${path})`);
		let f = this.getCache(path);
		if (undefined!=f) {
			return Promise.resolve<File>(f);
		}
		return this.parent.Read(path)
		.then( (f)=>this.setCache(f) );
	}
	Write(path:string, data:string):Promise<File> {
		return this.parent.Write(path, data)
		.then( (f)=>this.setCache(f) );
	}
	// A transparent FS, so the call to parent needs to actually
	// be the call to its parent's parent
	Parent(name=``):FS {
		return this.parent.Parent(name);
	}
	Remove(path:string):Promise<File> {
		return this.parent.Remove(path)
		.then((f)=>this.setCache(f));
	}
	Sync(path:string):Promise<File> {
		return this.parent.Sync(path)
		.then((f)=>this.setCache(f));
	}
	Revert(path:string):Promise<File> {
		return this.parent.Revert(path)
		.then((f)=>this.setCache(f));
	}
}
