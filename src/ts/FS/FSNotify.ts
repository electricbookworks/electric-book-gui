import {FS, FileContent, FileStat} from './FS';

import signals = require('signals');

/**
 * FSNotify implements a FS that passes all actual
 * functions through to an underlying FS, but that
 * notifies listeners of activities on the FS.
 */
export class FSNotify {
	public Listeners : signals.Signal;

	constructor(protected source:FS) {
		this.Listeners = new signals.Signal();
	}
	Write(path:string, stat:FileStat, content?:string):Promise<FileContent> {
		return this.source.Write(path,stat,content)
		.then(
			(fc:FileContent)=>{
				this.Listeners.dispatch(path, fc);
				return Promise.resolve<FileContent>(fc);
			});
	}
	Remove(path:string,stat?:FileStat):Promise<FileContent> {
		return this.source.Remove(path,stat)
		.then(
			(fc:FileContent)=>{
				this.Listeners.dispatch(path, fc);
				return Promise.resolve<FileContent>(fc);
			});
	}
	Rename(fromPath:string,toPath:string) : Promise<FileContent> {
		return this.source.Rename(fromPath, toPath)
		.then(
			(fc:FileContent)=>{
				this.Listeners.dispatch(fromPath, fc);
				return Promise.resolve<FileContent>(fc);
			});
	}
	Revert(path:string): Promise<FileContent> {
		return this.source.Revert(path)
		.then(
			(fc:FileContent)=>{
				this.Listeners.dispatch(path, fc);
				return Promise.resolve<FileContent>(fc);
			});
	}
	//=============================================================
	//======= all methods below this point simply pass their calls
	//======= to the underlying FS, and don't require notification.
	//=============================================================
	Sync(path?:string):Promise<void> { return this.source.Sync(); }
	RepoOwnerName():[string,string] { return this.source.RepoOwnerName(); }	
	Stat(path:string) : Promise<FileStat> { return this.source.Stat(path); }
	Read(path:string) : Promise<FileContent> { return this.source.Read(path); }
}