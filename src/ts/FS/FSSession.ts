import {FileStat, FileContent, FS} from './FS';
import {Store} from './Store';

export class FSSession {
	protected key: string;
	constructor(
		protected name: string,
		protected repoOwner:string, 
		protected repoName:string,
		protected defaultRemoveStat:FileStat = FileStat.Deleted) 
	{
		this.key = encodeURIComponent(this.name) + `:` +
			encodeURIComponent(this.repoOwner) + `:` +
			encodeURIComponent(this.repoName) + `:`;
	}
	protected get(path:string) : FileContent {
		let js = Store().getItem(this.key+path);
		if (!js) {
			return undefined;
		}
		return FileContent.FromJS(js);				
	}
	protected set(c : FileContent) {
		if (c.Stat==FileStat.NotExist) {
			this.delete(c.Name);
			return;
		}
		Store().setItem(this.key+c.Name, c.Serialize());
	}
	protected delete(path:string) {
		Store().removeItem(this.key+path);
	}

	Stat(path:string) : Promise<FileStat> {
		let c = this.get(path);
		return Promise.resolve<FileStat>( c ? c.Stat : FileStat.NotExist);
	}

	Read(path:string) : Promise<FileContent> {
		let c = this.get(path);
		if (!c) {
			return Promise.reject(`${path} does not exist`);
		}
		return Promise.resolve<FileContent>(c);
	}

	Write(path:string, stat: FileStat, content?: string): Promise<FileContent> {
		let f= new FileContent(path, stat, content);
		this.set(f);
		return Promise.resolve<FileContent>(f);
	}

	Remove(path:string, stat?:FileStat) : Promise<FileContent> {
		let c = this.get(path);
		if (!c) {
			console.log(`Tried to remove ${path} which does not appear to exist`);
			return Promise.resolve<FileContent>(new FileContent(path, FileStat.NotExist));
		}
		if (!stat) {
			stat = this.defaultRemoveStat;
		}
		let fc = new FileContent(path, stat, c.Content);
		this.set(fc);
		return Promise.resolve<FileContent>(fc);
	}

	Rename(fromPath:string, toPath:string) : Promise<FileContent> {
		if (fromPath==toPath) {
			return Promise.reject(`Renaming isn't changing name`);
		}
		let f = this.get(fromPath);
		let t = this.get(toPath);
		if (!f) {
			return Promise.reject(`${fromPath} does not exist`);
		}
		if (t) {
			return Promise.reject(`${toPath} already exists`);
		}
		t = new FileContent(toPath, FileStat.Changed, f.Content, f);
		this.set(t);

		f = new FileContent(fromPath, this.defaultRemoveStat, f.Content);
		this.set(f);

		return Promise.resolve<FileContent>(t);
	}

	Sync(path?:string):Promise<void> {
		return Promise.reject(`FSSession doesn't support Sync`);
	}

	RepoOwnerName():[string,string] {
		return [this.repoOwner, this.repoName];
	}
	
	Revert(path:string): Promise<FileContent> {
		return Promise.reject(`FSSession doesn't support Revert`);
	}
}