import {FileContentSession} from './FileContentSession';
import {FileContentRemote} from './FileContentRemote';
import {FileContentInterface} from './FileContentInterface';

// FileContentOverlay overlays a FileContent system on 
// top of another.
export class FileContentOverlay {
	protected cache: FileContentSession;

	constructor(
		protected repoOwner:string, 
		protected repoName:string,
		protected source: FileContentInterface)
	{
		this.cache = new FileContentSession(`overlay-cache`, this.repoOwner, this.repoName);
	}

	Exists(path:string, fromCacheOnly:boolean=false) : Promise<boolean> {
		return this.cache.Exists(
			(e)=>{
				// If our local cache doesn't know about import
				// we ask the source.	
				if (fromCacheOnly || e) {
					return Promise.resolve<boolean>(e);
				}
				return this.source.Exists(path)
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