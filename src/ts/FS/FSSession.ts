import {FileStat, FileContent, FS} from './FS';
import {Store} from './Store';

export class FSSession {
	protected key: string;
	constructor(
		protected name: string,
		protected repoOwner:string, 
		protected repoName:string) 
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
	Remove(path:string) : Promise<void> {
		let c = this.get(path);
		if (!c) {
			console.log(`Tried to remove ${path} which does not appear to exist`);
			return Promise.resolve<void>();
		}
		this.set(new FileContent(path, FileStat.Deleted, c.Content));
		return Promise.resolve<void>();
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
		this.delete(fromPath);
		return Promise.resolve<FileContent>(t);
	}

	Sync():Promise<void> {
		return Promise.reject(`FSSession doesn't support Sync`);
	}
	RepoOwnerName():[string,string] {
		return [this.repoOwner, this.repoName];
	}
}