import {FSSession} from './FSSession';
import {FS,FileStat,FileContent} from './FS';

// FSCache is PURELY a session storage based
// cache over a resource-intensive remote cache. It
// caches file existence and file reads, but all
// writes, renames and removes are handled by the remote
// content system. It doesn't track any sense of
// Dirty file state.
//
// FSCache has some extensions over the regular
// FS because it can Revert: revert a file to 
// its original content.
export class FSCache {
	protected cache: FSSession;

	constructor(
		protected repoOwner:string, 
		protected repoName:string,
		protected source: FS)
	{
		this.cache = new FSSession(`source-cache`, this.repoOwner, this.repoName);
	}

	RepoOwnerName():[string,string] {
		return [this.repoOwner, this.repoName];
	}

	Stat(path:string): Promise<FileStat> {
		return this.cache.Stat(path)
			.then( 
				(s:FileStat)=>{
					if (FileStat.NotExist==s) {
						return this.source.Stat(path);
					}
					return Promise.resolve<FileStat>(s);
				})
	}

	Read(path:string) : Promise<FileContent> {
		return this.cache.Stat(path)
		.then(
			(s:FileStat)=>{
				switch (s) {
					case FileStat.Exists:
						//fallthrough
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

	Write(path:string, stat:FileStat, content?: string): Promise<FileContent> {
		return this.source.Write(path, stat, content).then(
			()=>{
				return this.cache.Write(path,stat,content);
			});
	}

	Remove(path:string) : Promise<void> {
		return this.source.Remove(path).then(
			()=>{
				return this.cache.Remove(path);
			}
		);
	}

	Rename(fromPath:string, toPath:string) : Promise<FileContent> {
		return this.source.Rename(fromPath, toPath).then(
			()=>{
				return this.cache.Rename(fromPath, toPath);
			});
	}

	Revert(path:string) : Promise<FileContent> {
		return this.cache.Read(path).then(
			(c:FileContent)=>{
				return this.source.Read(c.OriginalName());
			}).then(
			(c:FileContent)=>{
				return this.cache.Write(path, c.Stat, c.Content)
			}).then(
			()=>{
				return this.cache.Read(path);
			});
	}
	Sync() : Promise<void> {
		return Promise.reject(`FSCache doesn't implement Sync()`);
	}
}