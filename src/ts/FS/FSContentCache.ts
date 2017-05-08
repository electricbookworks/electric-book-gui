// I'm not sure that this is required.

// import {FS} from './FS';

// /**
//  * FSContentCache ONLY caches content for files, so it
//  * handles Read and Write, and critically, rename.
//  */
// export class FSContentCache {
// 	protected key:string;
// 	constructor(protected source:FS) {
// 		let [repoOwner, repoName] = this.source.RepoOwnerName();
// 		this.key = `content-cache:${encodeURIComponent(repoOwner)}:` +
// 		`${encodeURIComponent(repoName)}:`;
// 	}
// 	protected get(path:string):string {
// 		return sessionStorage.getItem(this.key + path);
// 	}
// 	protected set(path:string, content: string) {
// 		sessionStorage.setItem(this.key + path, content);
// 	}
// 	protected delete(path:string) {
// 		sessionStorage.deleteItem(this.key+path);
// 	}
// 	Stat(path:string) : Promise<FileStat> {
// 		return this.source.Stat(path);
// 	}
// 	Read(path:string) : Promise<FileContent> {
// 		return this.source.Read(path)
// 		.then(
// 			(fc)=>{
// 				let c = this.get(path);
// 			});
// 	}
// 	Write(path:string, stat:FileStat, content:string):Promise<FileContent> {
// 		return this.source.
// 	}
// 	Remove(path:string):Promise<void> {
// 		return this.source.Remove(path);
// 	}
// 	Rename(fromPath:string,toPath:string) :Promise<FileContent> 
// 	{

// 	}
// 	Sync():Promise<void> {
// 		return this.source.Sync();
// 	}
// 	RepoOwnerName():[string,string] {
// 		return this.source.RepoOwnerName();
// 	}	

// }