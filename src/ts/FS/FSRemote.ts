import {EBW} from '../EBW';
import {FS,FileStat,FileContent} from './FS';

/**
 * FSRemote is a FileSystem stored on a remote
 * server.
 */
export class FSRemote {
	constructor(
		protected repoOwner:string, 
		protected repoName:string) 
	{
	}
	Stat(path:string) : Promise<FileStat> {
		return EBW.API()
			.FileExists(this.repoOwner, this.repoName, path)
			.then(
				([exists]:[boolean])=>{
					// Remote system is definitive
					return Promise.resolve<FileStat>( exists ? FileStat.Exists : FileStat.NotExist);
				}) as Promise<FileStat>;
	}
	Read(path:string) :Promise<FileContent> {
		return EBW.API()
		.GetFileString(this.repoOwner, this.repoName, path)
		.then(
			([content]:[string])=>{
				return new FileContent(path, FileStat.Exists, content);
			});
	}
	Write(path:string, stat:FileStat, content?: string): Promise<FileContent> {
		if ('undefined' == typeof content) {
			return Promise.reject(`FSRemote cannot write file ${path} without content.`);
		}
		return EBW.API()
		.UpdateFile(this.repoOwner, this.repoName, path, content)
		.then(
			()=>{
				return new FileContent(path, FileStat.Exists, content);
			}
		);
	}
	Rename(fromPath:string, toPath: string): Promise<FileContent> {
		return EBW.API().RenameFile(this.repoOwner, this.repoName, fromPath, toPath)
		.then(
			()=>{
				return this.Read(toPath);
			});
	}
	Remove(path:string, stat?:FileStat) : Promise<FileContent> {
		return EBW.API().RemoveFile(this.repoOwner, this.repoName, path)
		.then(
			()=>{
				return Promise.resolve<FileContent>(new FileContent(path, FileStat.NotExist));
			}
		);
	}
	Sync(path?:string) : Promise<void> {
		return Promise.reject(`FSRemote doesn't support Sync()`);
	}
	RepoOwnerName() : [string,string] {
		return [this.repoOwner, this.repoName];
	}
	Revert(path:string):Promise<FileContent> {
		return Promise.reject(`FSRemove doesn't support Revert`);
	}
}