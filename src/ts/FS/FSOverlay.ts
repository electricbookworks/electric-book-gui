import {FS,FileStat,FileContent} from './FS';

export class FSOverlay {
	protected changes : Set<string>;
	constructor(protected below:FS, protected above:FS) {
		this.changes = new Set<string>();
	}

	RepoOwnerName():[string,string] {
		return this.below.RepoOwnerName();
	}

	Stat(path:string): Promise<FileStat> {
		return this.above.Stat(path)
			.then( 
				(s:FileStat)=>{
					if (FileStat.NotExist==s) {
						return this.below.Stat(path);
					}
					return Promise.resolve<FileStat>(s);
				});
	}

	Read(path:string) : Promise<FileContent> {
		return this.above.Stat(path)
		.then(
			(s:FileStat)=>{
				switch (s) {
					case FileStat.Exists:
						//fallthrough
					case FileStat.Changed:
						//fallthrough
					case FileStat.New:
						//fallthrough
					case FileStat.Deleted:
						return this.above.Read(path);						
					case FileStat.NotExist:
						return this.below.Read(path)
						.then(
							(c)=>{
								this.above.Write(path, c.Stat, c.Content);
								return Promise.resolve<FileContent>(c);
							});
				}
			});
	}

	Write(path:string, stat:FileStat, content?: string): Promise<FileContent> {
		return this.above.Write(path, stat, content)
		.then(
			(fc)=>{
				this.changes.add(path);
				return Promise.resolve(fc)
			});
	}

	Remove(path:string) : Promise<void> {
		return this.above.Remove(path)
		.then(
			()=>{
				this.changes.add(path);
				return Promise.resolve();
			}
		);
	}

	Rename(fromPath:string, toPath:string) : Promise<FileContent> {
		return this.above.Rename(fromPath, toPath)
		.then(
			(fc)=>{
				this.changes.add(fromPath);
				this.changes.add(toPath);
				return Promise.resolve<FileContent>(fc);
			});
	}

	Revert(path:string) : Promise<FileContent> {
		return this.above.Read(path)
		.then(
			(c:FileContent)=>{
				return this.below.Read(c.OriginalName());
			})
		.then(
			(c:FileContent)=>{
				return this.above.Write(path, c.Stat, c.Content)
			})
		.then(
			()=>{
				// Unless it's a renamed file,
				// we're going to undo any
				// changes on the file...
				// @TODO Not sure what I was doing here...
				// need to complete it...
				// if (this.)
				return this.above.Read(path);
			});
	}
	Sync() : Promise<void> {
		return Promise.reject(`FSCache doesn't implement Sync()`);
	}	
}