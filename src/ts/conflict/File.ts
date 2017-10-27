import signals = require('signals');
import {Context} from '../Context';
import {EBW} from '../EBW';
import {FileStatus} from './FileStatus';

export class FileContent {
	public Exists: boolean;
	public Raw: string;
	constructor(exists:boolean, raw:string) {
		this.Exists = exists;
		this.Raw = raw ? raw : ``;
	}
}

export enum FileEvent {
	WorkingChanged,
	TheirChanged,
	StatusChanged
}

export class MergeFileResolutionState {
	State: number;
	Description: string;
}

// File models a single conflicted file in the repo.
// All communication with the conflicted file occurs through this single
// class, which will coordinate any other internal-classes that it might need,
// like the file status.
export class File {
	protected status : FileStatus;
	public Listen : signals.Signal;
	// Signalled when RPC is in progress
	public ListenRPC: signals.Signal;

	protected cache : Map<string,FileContent>;
	constructor(protected context:Context,protected path: string, status:string) {
		this.status = new FileStatus(status);
		this.Listen = new signals.Signal();
		this.ListenRPC = new signals.Signal();
		this.cache = new Map<string,FileContent>();
	}
	Status(): string {
		if (this.status) {
			return this.status.Status();
		}
		return 'undefined';
	}
	SetStatus(source:any, status:string) {
		this.status.SetStatus(status);
		this.Listen.dispatch(source, FileEvent.StatusChanged, status);
	}
	Path() : string {
		return this.path;
	}

	/* THE FOLLOWING METHODS HANDLE CONTENT FOR THE FILE */
	ClearCache() : void {
		this.cache.clear();
	}
	FetchContent(source:any) : Promise<void> {
		if (this.cache.has(`working`)) {
			return Promise.resolve();
		}
		this.ListenRPC.dispatch(source, true, `FetchContent`);
		return this.context.API()
		.MergedFileCat(this.context.RepoOwner, this.context.RepoName, this.path)
		.then(
			([workingExists, working, theirExists, their, gitMerge]:[boolean,string,boolean,string,string])=>{
				let workingFile = new FileContent(workingExists, working);
				let theirFile = new FileContent(theirExists, their);
				let gitFile = new FileContent(true, gitMerge);
				this.cache.set(`working`, workingFile);
				this.cache.set(`their`, theirFile);
				this.cache.set(`git`, gitFile)

				this.ListenRPC.dispatch(source, false, `FetchContent`);
				this.Listen.dispatch(source, FileEvent.WorkingChanged, workingFile);
				this.Listen.dispatch(source, FileEvent.TheirChanged, theirFile);
				return Promise.resolve();
			});
	}
	SetWorkingExists(b:boolean):void{
		this.WorkingFile().Exists = true;
	}
	SetTheirExists(b:boolean):void {
		this.TheirFile().Exists = true;
	}
	// FetchGit fetches the git merged content for the file
	FetchGit(source:any):Promise<void>{
		if (this.cache.has(`git`)) {
			return Promise.resolve();
		}
		this.ListenRPC.dispatch(source, true, `FetchGit`);
		return this.context.API()
		.MergedFileGit(this.context.RepoOwner, this.context.RepoName, this.path)
		.then(
			([automerged, text]:[boolean,string])=> {
				let gitFile = new FileContent(true, text);
				this.cache.set(`git`, gitFile);
				this.ListenRPC.dispatch(source, false, `FetchGit`);
				// TODO: Should it be WorkingChanged that we're sending?
				this.Listen.dispatch(source, FileEvent.WorkingChanged, gitFile);
				return Promise.resolve();
		});
	}
	RevertOur(source:any) : Promise<FileContent> {
		this.ListenRPC.dispatch(source, true, `RevertOur`);
		return this.mergeFileOriginal("our")
		.then(
			(fc:FileContent)=>{
				this.cache.set(`working`, fc);
				this.ListenRPC.dispatch(source, false, `RevertOur`);
				this.Listen.dispatch(source, FileEvent.WorkingChanged, fc);
				return Promise.resolve(fc);
			});
	}
	RevertOurToTheir(source:any) : Promise<FileContent> {
		this.ListenRPC.dispatch(source, true, `RevertOurToTheir`);
		return this.mergeFileOriginal("their")
		.then(
			(fc:FileContent)=>{
				this.cache.set(`working`, fc);
				this.ListenRPC.dispatch(source, false, `RevertOur`);
				this.Listen.dispatch(source, FileEvent.WorkingChanged, fc);
				return Promise.resolve(fc);
			})
	}
	RevertOurToGit(source: any) : Promise<FileContent>{ 
		this.ListenRPC.dispatch(source, true, `RevertOurToGit`);
		return this.mergeFileOriginal("git")
		.then(
			(fc:FileContent)=>{
				this.cache.set(`working`, fc)
				this.ListenRPC.dispatch(source, false, `RevertOurToGit`);
				this.Listen.dispatch(source, FileEvent.WorkingChanged, fc);
				return Promise.resolve(fc);
			})
	}
	RevertTheir(source:any) : Promise<FileContent> {
		this.ListenRPC.dispatch(source, true,`RevertTheir`);
		return this.mergeFileOriginal("their")
		.then(
			(fc:FileContent)=>{
				this.cache.set(`their`, fc);
				this.ListenRPC.dispatch(source, false, `RevertTheir`);
				this.Listen.dispatch(source, FileEvent.TheirChanged, fc);
				return Promise.resolve(fc);
			});
	}
	mergeFileOriginal(v:string) : Promise<FileContent> {
		return this.context.API()
		.MergeFileOriginal(this.context.RepoOwner, this.context.RepoName, this.path, v)
		.then(
			([exists,raw]:[boolean,string])=>{
				return Promise.resolve<FileContent>(new FileContent(exists, raw));
			});
	}
	protected getCachedContent(key:string) : FileContent {
		return this.cache.get(key);
	}
	protected setCachedContent(key:string, value:FileContent) : void {
		this.cache.set(key,value);
	}
	TheirFile() : FileContent {
		return this.cache.get(`their`);
	}
	WorkingFile() : FileContent {
		return this.cache.get(`working`);
	}
	RemoveWorkingFile(source:any) : void {
		let fc = new FileContent(false, ``);
		this.cache.set(`working`, fc);
		this.Listen.dispatch(source, FileEvent.WorkingChanged, fc);
		// Don't need to delete on server as this will happen on file save
	}
	RemoveTheirFile(source:any) : void {
		let fc = new FileContent(false, ``);
		this.cache.set(`their`, new FileContent(false, ``));
		this.Listen.dispatch(source, FileEvent.TheirChanged, fc);
		// Don't need to delete on server as this will happen on file save
	}
	SetWorkingContent(source:any,content:string) : void {
		let fc = new FileContent(content!=undefined, content);
		this.cache.set(`working`, fc);
		this.Listen.dispatch(source, FileEvent.WorkingChanged, fc);
	}
	SetTheirContent(source:any, content:string) : void {
		let fc = new FileContent(content!=undefined, content);
		this.cache.set(`their`, fc);
		this.Listen.dispatch(source, FileEvent.TheirChanged, fc);
	}
	Save() : Promise<void> {
		let working = this.cache.get(`working`);
		let their = this.cache.get(`their`);
		this.ListenRPC.dispatch(this, true, `Save`);
		return this.context.API()
		.SaveMergingFile(
			this.context.RepoOwner, this.context.RepoName,
			this.Path(),
			working.Exists, working.Raw,
			their.Exists, their.Raw
			)
		.then(
			([status]:[string])=>{
				this.ListenRPC.dispatch(this, false, `Save`);
				this.SetStatus(undefined, status);
				return Promise.resolve();
			});
	}
	Stage(source:any):Promise<void> {
		this.ListenRPC.dispatch(this,true,`Stage`);
		return this.context.API()
		.StageFileAndReturnMergingState(
			this.context.RepoOwner, 
			this.context.RepoName,
			this.Path()
		).then(
			([status]:[string])=>{
				this.ListenRPC.dispatch(this,false, `Stage`);
				this.SetStatus(source, status);
				return Promise.resolve();
			});
	}
}