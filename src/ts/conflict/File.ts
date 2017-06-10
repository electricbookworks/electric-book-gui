import signals = require('signals');
import {Context} from '../Context';
import {EBW} from '../EBW';
import {FileStatus} from './FileStatus';

// File models a single conflicted file in the repo.
// All communication with the conflicted file occurs through this single
// class, which will coordinate any other internal-classes that it might need,
// like the file status.
export class File {
	protected status : FileStatus;
	public Listen : signals.Signal;

	protected cache : Map<string,string>;
	constructor(protected context:Context,protected path: string, status:string) {
		this.status = new FileStatus(status);
		this.Listen = new signals.Signal();
		this.cache = new Map<string,string>();
	}
	Status(): string {
		if (this.status) {
			return this.status.Status();
		}
		return 'undefined';
	}
	Path() : string {
		return this.path;
	}

	/* THE FOLLOWING METHODS HANDLE CONTENT FOR THE FILE */
	ClearCache() : void {
		this.cache.clear();
	}
	FetchContent() : Promise<void> {
		return this.context.API()
		.MergedFileCat(this.context.RepoOwner, this.context.RepoName, this.path)
		.then(
			([our,their, wd]:[string,string,string])=>{
				this.cache.set('content-our', our);
				this.cache.set('content-their', their);
				this.cache.set(`content-wd`, wd)
				return Promise.resolve();
			});
	}
	protected getCachedContent(key:string) : Promise<string> {
		if (this.cache.has(key)) {
			return Promise.resolve<string>(this.cache.get(key));
		}
		return this.FetchContent().then(
			()=>{
				return Promise.resolve<string>(this.cache.get(key));
			});
	}
	setCachedContent(key:string, value:string) : void {
		this.cache.set(key,value);
	}
	OurContent() : Promise<string> {
		return this.getCachedContent(`content-our`);
	}
	TheirContent() : Promise<string> {
		return this.getCachedContent(`content-their`);
	}
	WorkingContent() : Promise<string> {
		return this.getCachedContent(`content-wd`);
	}
	SetOurContent(content:string) : void {
		this.cache.set(`content-our`, content);
	}
	SetTheirContent(content:string) : void {
		this.cache.set(`content-their`, content);
	}
	SetWorkingContent(content:string) : void {
		this.cache.set(`content-wd`, content);
	}
	// SaveWorkingContent will both save the content into our cache,
	// and update the repo, including adding the item into the
	// index.
	// TODO: Determine if this marks the File as resolved.
	SaveWorkingContent(content:string) : Promise<void> {
		this.cache.set(`content-wd`, content);
		return this.context.API()
		.UpdateFile(
			this.context.RepoOwner, this.context.RepoName, 
			this.Path(), content)
		.then(
			()=>{
				// TODO: Need to update STATUS
				this.Listen.dispatch(this);
				return Promise.resolve();
			});
	}
	DeleteWorkingContent() : Promise<void> {
		return this.context.API()
		.RemoveFile(this.context.RepoOwner, this.context.RepoName, this.Path())
		.then(
			()=>{
				// TODO: Need to update STATUS
				this.Listen.dispatch(this);
				return Promise.resolve();
			});
	}
}