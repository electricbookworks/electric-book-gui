import {FSSession} from './FSSession';
import {FS,FileStat,FileContent} from './FS';

/**
 * FSReadCache is PURELY a session storage based
 * cache over a resource-intensive remote cache. It
 * caches file existence and file reads, but all
 * writes, renames and removes are handled by the remote
 * content system. It doesn't track any sense of
 * Dirty file state.
 * 
 * Because FSReadCache is purely a READ Cache, it cannot
 * do anything like revert, since that requires the underlying
 * FS to handle revert, so Revert is simply passed to the
 * underlying FS.
 */
export class FSReadCache {
	protected cache: FSSession;

	constructor(protected source: FS)
	{
		let [owner,name] = this.source.RepoOwnerName();
		this.cache = new FSSession(`source-cache`, owner, name);
	}

	RepoOwnerName():[string,string] {
		return this.source.RepoOwnerName();
	}

	Read(path:string) : Promise<FileContent> {
		return this.cache.Stat(path)
		.then(
			(s:FileStat)=>{
				switch (s) {
					case FileStat.Exists:
						return this.readAndCachePath(path);
					case FileStat.Changed:
						//fallthrough
					case FileStat.New:
						//fallthrough
					case FileStat.Deleted:
						return this.cache.Read(path);						
					case FileStat.NotExist:
						return this.source.Read(path)
						.then(
							(c)=>{
								this.cache.Write(path, c.Stat, c.Content);
								return Promise.resolve<FileContent>(c);
							});
				}
			});
	}

	protected readAndCachePath(path:string) : Promise<FileContent> {
		return this.cache.Read(path)
		.then(
			(fc:FileContent)=>{
				if (fc.Content) {
					return Promise.resolve<FileContent>(fc);
				}
				return this.source.Read(path)
				.then(
					(fc:FileContent)=>{
						return this.cache.Write(path, fc.Stat, fc.Content);
					});
			});		
	}

	Remove(path:string,stat?:FileStat) : Promise<FileContent> {
		return this.source.Remove(path,stat).then(
			(fc:FileContent)=>{
				return this.cache.Remove(path, fc.Stat);
			}
		);
	}

	Rename(fromPath:string, toPath:string) : Promise<[FileContent,FileContent]> {
		return this.source.Rename(fromPath, toPath).then(
			([fOld, fNew]:[FileContent,FileContent])=>{
				return this.cache.Write(toPath, fNew.Stat, fNew.Content)
				.then(
					(_:FileContent)=>{
						return this.cache.Remove(fromPath, fOld.Stat);
					})
				.then(
					(_:FileContent)=>{
						return Promise.resolve<[FileContent,FileContent]>([fOld,fNew]);
					});
			});
	}

	Revert(path:string) : Promise<FileContent> {
		return this.source.Revert(path)
		.then(
			(c:FileContent)=>{
				return this.cache.Write(c.Name, c.Stat, c.Content);
			});
	}

	Stat(path:string): Promise<FileStat> {
		return this.cache.Stat(path)
			.then( 
				(s:FileStat)=>{
					if (FileStat.NotExist==s) {
						return this.source.Stat(path);
					}
					return Promise.resolve<FileStat>(s);
				});
	}

	Sync(path?:string) : Promise<FileContent[]> {
		return this.source.Sync(path);
	}

	Write(path:string, stat:FileStat, content?: string): Promise<FileContent> {
		if ('undefined'==typeof content) {
			return this.cache.Write(path,stat);
		}
		return this.source.Write(path, stat, content).then(
			(fc:FileContent)=>{
				return this.cache.Write(fc.Name, fc.Stat, fc.Content);
			});
	}	
	IsDirty(path:string):Promise<boolean> { return Promise.reject(`FSReadCache doesn't support IsDirty`); }

}