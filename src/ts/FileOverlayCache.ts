import {FileContentSession} from './FileContentSession';
import {FileContentRemote} from './FileContentRemote';

// FileContentCache is PURELY a session storage based
// cache over a resource-intensive remote cache. It
// caches file existence and file reads, but all
// writes, renames and removes are handled by the remote
// content system. It doesn't track any sense of
// Dirty file state.
export class FileContentCache {
	protected cache: FileContentSession;

	constructor(
		protected repoOwner:string, 
		protected repoName:string,
		protected source: FileContentRemote)
	{
		this.cache = new FileContentSession(`source-cache`, this.repoOwner, this.repoName);
	}

	Exists(path:string, fromCacheOnly:boolean=false) : Promise<boolean> {
		return this.cache.Exists(
			(e)=>{
				// If our local cache doesn't know about import
				// we ask the source.	
				if (fromCacheOnly || e) {
					return Promise.resolve<boolean>(e);
				}
				return this.source.Exists()
			});
	}
	Read(path:string) : Promise<string> {
		this.cache.Exists(path)
		.then(
			(exists)=>{
				if (exists) {
					return this.cache.Read(path)
					.then(
						(content)=>{
							if (content) {
								return Promise.resolve<string>(content);
							}
							return this.source.Read(path)
							.then(
								(content)=>{
									// Once read from source, we cache
									return this.cache.Write(path, content)
									.then( ()=>{
										return Promise.resolve<string>(content);
									});
								})
						})
				} else {
					// file doesn't exist in our cache
					return this.source.Read(path)
					.then(
						(content)=>{
							return this.cache.Write(path,content)
							.then(
								()=>{
									return Promise.resolve<string>(content);
								})''
						});
				}
		});
	}
	Write(path:string, content: string): Promise<void> {
		return this.source.Write(path,content)
		.then(
			()=>{
				return this.cache.Write(path,content);
			}
		);
	}
	Remove(path:string) : Promise<void> {
		return this.source.Remove(path)
		.then(
			()=>{
				return this.cache.Remove(path);
			}
		);
	}
	Rename(fromPath:string, toPath:string) : Promise<void> {
		return this.source.Rename(fromPath, toPath)
		.then(
			()=>{
				return this.cache.Rename(fromPath, toPath);
			});
	}
}