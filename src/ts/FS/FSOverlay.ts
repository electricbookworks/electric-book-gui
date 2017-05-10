import {FS,FileStat,FileContent} from './FS';

export class FSOverlay {
	protected changes : Set<string>;
	constructor(protected below:FS, protected above:FS) {
		this.changes = new Set<string>();
	}

	IsDirty(path:string) : Promise<boolean> {
		return this.above.Stat(path)
		.then(
			(aboveStat:FileStat)=>{
				console.log(`FSOverlay.IsDirty(${path}) above = ${aboveStat}`);
				if (aboveStat==FileStat.Exists || aboveStat==FileStat.NotExist) {
					return Promise.resolve<boolean>(false);
				}
				if (aboveStat==FileStat.New) {
					return Promise.resolve<boolean>(true);
				}
				return this.below.Stat(path)
				.then(
					(belowStat)=>{
						console.log(`FSOverlay.IsDirty(${path}) below = ${belowStat}`);
						switch(belowStat) {
							case FileStat.NotExist:
							//fallthrough
							case FileStat.Changed:
							//fallthrough
							case FileStat.New:
							//fallthrough
							case FileStat.NotExist:
								return Promise.resolve<boolean>(true);
						}
						return Promise.all([this.above.Read(path), this.below.Read(path)])
						.then(
							(fcs:FileContent[])=>{
								let [aboveC, belowC] = fcs;
								console.log(`FSOverlay.IsDirty(${path}): aboveC =`);
								console.log(aboveC);
								console.log(`belowC = `);
								console.log(belowC);
								console.log(`Resolving aboveC.Content!=belowC.Content = `,
									aboveC.Content != belowC.Content);
								if (!aboveC.Content) {
									return Promise.resolve<boolean>(false);
								}

								return Promise.resolve<boolean>(aboveC.Content!=belowC.Content);
							});
					})
			});
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
						return this.readAndCachePath(path);
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
	protected readAndCachePath(path:string) : Promise<FileContent> {
		return this.above.Read(path)
		.then(
			(fc:FileContent)=>{
				if (fc.Content) {
					return Promise.resolve<FileContent>(fc);
				}
				return this.below.Read(path)
				.then(
					(fc:FileContent)=>{
						return this.above.Write(path, fc.Stat, fc.Content);
					});
			});		
	}

	Write(path:string, stat:FileStat, content?: string): Promise<FileContent> {
		return this.above.Write(path, stat, content)
		.then(
			(fc:FileContent)=>{
				console.log(`FSOverlay.Write(${path}): stat = ${stat}`);
				if (!(fc.Stat==FileStat.Exists || fc.Stat==FileStat.NotExist)) {
					this.changes.add(path);
				}
				return Promise.resolve<FileContent>(fc)
			});
	}

	Remove(path:string, stat?:FileStat) : Promise<FileContent> {
		return this.above.Remove(path,stat)
		.then(
			(fc:FileContent)=>{
				this.changes.add(path);
				return Promise.resolve<FileContent>(fc);
			}
		);
	}

	Rename(fromPath:string, toPath:string) : Promise<[FileContent,FileContent]> {
		return this.above.Rename(fromPath, toPath)
		.then(
			([fOld,fNew]:[FileContent,FileContent])=>{
				console.log(`FSOverlay.Rename.then : fOld, fNew = `, fOld, fNew);
				this.changes.add(fromPath);
				this.changes.add(toPath);
				return Promise.resolve<[FileContent,FileContent]>([fOld,fNew]);
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
			(fc:FileContent)=>{
				// We're reverted path, so it's not longer
				// changed.
				this.changes.delete(path);
				return this.above.Read(path);
			});
	}
	Sync(path?:string) : Promise<FileContent[]> {		
		// If we're given a path name, then we work with
		// that path only. If we' are not given a path,
		// we synchronised all changed files.
		if (path) {
			return this.above.Read(path)
			.then(
				(fc:FileContent)=>{
					switch(fc.Stat) {
						case FileStat.New:
							// fallthrough
						case FileStat.Changed:
							return this.below.Write(fc.Name, fc.Stat, fc.Content);
						case FileStat.Deleted:
							// fallthrough
						case FileStat.NotExist:
							return this.below.Remove(fc.Name, fc.Stat);
					}
					return Promise.resolve<FileContent>(fc);
				})
			.then(
				(fc:FileContent)=>{
					return this.above.Write(fc.Name, fc.Stat, fc.Content);
				})
			.then(
				(fc:FileContent)=>{
					this.changes.delete(path);
					return Promise.resolve<FileContent[]>([fc]);
				}
			);
		}
		// We do two passes through our changes list, first
		// doing all Writes then doing all Deletes. Therefore,
		// if any writes fail, the deletes aren't executed, which
		// can be valuable when managing renames.
		let writePromises = new Array<Promise<FileContent>>();
		for (let p of this.changes) {
			writePromises.push( 
				this.above.Read(p)
				.then(
					(fc:FileContent)=>{
						if (fc.Stat==FileStat.New || fc.Stat==FileStat.Changed) {
							return this.below.Write(p, fc.Stat, fc.Content);
						} else {
							return Promise.resolve<FileContent>(fc);
						}
					})
				.then(
					(fc:FileContent)=>{
						if (fc) {
							return this.above.Write(p, fc.Stat, fc.Content);
						} else {
							return Promise.resolve<FileContent>(fc);
						}
					})
			);
		}
		
		return Promise.all<FileContent>(writePromises)
		.then(
			(fcsP:FileContent[])=>{
				let removePromises: Promise<FileContent>[] = [] ;
				for (let fc of fcsP) {
					if (fc.Stat == FileStat.Deleted || fc.Stat==FileStat.NotExist) {
						removePromises.push(
							this.below.Remove(fc.Name)
							.then(
								(fc:FileContent)=>{
									return this.above.Remove(fc.Name, fc.Stat);
								})
						);
					} else {
						removePromises.push(Promise.resolve<FileContent>(fc));
					}
				}
				return Promise.all<FileContent>(removePromises);
			})
		.then(
			(fcs:FileContent[])=>{
				// We're synced, so there are not more changes
				this.changes.clear();
				return Promise.resolve<FileContent[]>(fcs);
			});
	}	
}