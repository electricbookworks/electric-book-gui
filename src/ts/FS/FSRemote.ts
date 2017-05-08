import {EBW} from './EBW';
import {FS,FileStat,FileContent} from './FS';

/**
 * FSRemote are files stored on a remote
 * server.
 */
export class FileContentRemote {
	constructor(
		protected repoOwner:string, 
		protected repoName:string) 
	{
	}
	Stat(path:string) : Promise<FileStat> {
		return 
			EBW.API()
			.FileExists(this.repoOwner, this.repoName, path)
			.then(
				(exists)=>{
					// Remote system is definitive
					return Promise<FileStat>( exists ? FileStat.Exists : FileStat.NotExist);
				}) as Promise<FileStat>;
	}
	Read(path:string) :Promise<FileContent> {
		return EBW.API()
		.GetFileString(this.repoOwner, this.repoName, path)
		.then(
			(content)=>{
				return new FileContent(path, FileStat.Exists, content);
			});
	}
	Write(path:string, stat:FileStat, content: string): Promise<FileContent> {
		if (stat!=FileStat.Exists) {
			return Promise.reject(`FSRemote only supports fileStat values of FileStat.Exists`);
		}
		return EBW.API()
		.UpdateFile(this.repoOwner, this.repoName, path, content)
		.then(
			()=>{
				return new FileContent(path, stat, content);
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
	Remove(path:string) : Promise<void> {
		return EBW.API().DeleteFile(this.repoOwner, this.repoName, path);
	}
	Sync() : Promise<void> {
		return Promise.reject(`FSRemote doesn't support Sync()`);
	}
	RepoOwnerName() : [string,string] {
		return [this.repoOwner, this.repoName];
	}
}