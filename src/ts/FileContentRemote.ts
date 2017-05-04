import {EBW} from './EBW';

/**
 * FileContentRemote are files stored on a remote
 * server.
 */
export class FileContentRemote {
	constructor(
		protected repoOwner:string, 
		protected repoName:string) 
	{
	}
	Exists(path:string) : Promise<boolean> {
		return EBW.API().FileExists(this.repoOwner, this.repoName, path)
			as Promise<boolean>;
	}
	Read(path:string) :Promise<string> {
		return EBW.API().GetFileString(this.repoOwner, this.repoName, path)
			as Promise<string>;
	}
	Write(path:string, content: string): Promise<void> {
		return EBW.API().UpdateFile(this.repoOwner, this.repoName, path, content)
			as Promise<void>;
	}
	Rename(fromPath:string, toPath: string): Promise<void> {
		return EBW.API().RenameFile(this.repoOwner, this.repoName, fromPath, toPath)
			as Promise<void>;
	}
	Remove(path:string) : Promise<void> {
		return EBW.API().DeleteFile(this.repoOwner, this.repoName, path) 
			as Promise<void>;
	}
}