import {FileModel} from './FileModel';
import {FS,FileStat,FileContent} from './FS';

export class FileModelCache {
	protected static singleton: FileModelCache;
	protected cache: Map<string, FileModelCache>;
	protected key: string;
	protected constructor(repoOwner:string,repoName:string,protected FS:FS) {
		this.cache = new Map<string,FileModel>();
		this.key = `${encodeURIComponent(repoOwner)}:${encodeURIComponent(repoName)}:`;
	}
	public static instance() :FileModelCache {
		if (!FileModelCache.singleton) {
			alert(`cannot call FileModelCache before calling initialize`);
			debugger;
		}
		return FileModelCache.singleton;
	}
	public static initialize(repoOwner:string,repoName:string) : FileModelCache {
		FileModelCache.singleton =  new FileModelCache(repoOwner, repoName);
		return FileModelCache.singleton;
	}
	public Get(path:string) : FileModel
	{
		let cacheKey = this.key + path;
		let fm = this.cache.get(cacheKey);
		if (fm) {
			return fm;
		}
		fm = new FileModel(path, this.FS);
		this.cache.set(cacheKey, fm);
		return fm;
	}
	public Rename(from:string, to:string) : Promise<void> {
		let fromKey = this.key + from;
		let toKey = this.key + to;
		if (this.cache.has(toKey)) {
			return Promise.reject(`Destination file already exists`);
		}
		if (!this.cache.has(fromKey)) {
			return Promise.reject(`Source file does not exist`);
		}
		let fm = this.cache.get(fromKey);
		return fm.Rename(from,to)
		.then(
			()=>{
				this.cache.add(toKey, fm);
				this.cache.delete(fromKey);
				return Promise.resolve<void>();
			}
		);
	}
}