import {FileInfo} from './FS/FileInfo';
import {RepoFileModel} from './RepoFileModel';
import {RepoFileModelOptions} from './RepoFileModelOptions';

export class RepoFileModelCache {
	protected static singleton: RepoFileModelCache;
	protected cache: Map<string, RepoFileModel>;
	protected constructor(protected repoOwner:string, protected repoName:string) {
		this.cache = new Map<string,RepoFileModel>();
	}
	public static instance() : RepoFileModelCache {
		if (!RepoFileModelCache.singleton) {
			alert(`cannot call RepoFileModelCache before calling initialize`);
			debugger;
		}
		return this.singleton;
	}
	public static initialize(repoOwner:string,repoName:string) : RepoFileModelCache {
		RepoFileModelCache.singleton =  new RepoFileModelCache(repoOwner, repoName);
		return RepoFileModelCache.singleton;
	}
	public Create(fi:FileInfo):RepoFileModel {
		return this.Get(fi, {newFile:true});
	}
	public Get(fi: FileInfo, 
		options:RepoFileModelOptions={}) : RepoFileModel
	{
		let cacheKey = `${this.repoOwner}/${this.repoName}:${fi.Name()}`;
		let fm = this.cache.get(cacheKey);
		if (fm) {
			return fm;
		}
		fm = new RepoFileModel(this.repoOwner, this.repoName,
			fi, options);
		this.cache.set(cacheKey, fm);
		return fm;
	}
	public Rename(from:string, to:string) : Promise<void> {
		let keyPrefix = `${this.repoOwner}/${this.repoName}:`
		let fromKey = keyPrefix + from;
		let toKey = keyPrefix + to;
		if (this.cache.has(toKey)) {
			return Promise.reject(`Destination file already exists`);
		}
		if (!this.cache.has(fromKey)) {
			return Promise.reject(`Source file does not exist`);
		}
		let rpm = this.cache.get(fromKey);
		return rpm.Rename(from,to)
		.then(
			()=>{
				this.cache.set(toKey, rpm);
				this.cache.delete(fromKey);
				return Promise.resolve();
			}
		);
	}
}