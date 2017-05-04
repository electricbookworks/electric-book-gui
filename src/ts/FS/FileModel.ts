import {EBW} from './EBW';
import {FileStat, FileContent, FS} from './FS';
import signals = require('signals');

/**
 * FileModel wraps a FileModel for a 
 * file in a FS.
 */
export class FileModel {
	protected DirtySignal: signals.Signal;
	protected EditingSignal : signals.Signal;
	protected editing: boolean;

	constructor(
		protected name: string
		protected FS: FS) 
	{
		this.DirtySignal = new signals.Signal();
		this.EditingSignal = new signals.Signal();
		return this;
	}
	Rename(fromPath:string, toPath:string):Promise<FileContent> {
		return this.FS.Rename(fromPath,toPath)
		.then(
			(f)=>{
				this.name = f.Name;
				return Promise.resolve(f);
			}
		);
	}
	Path() : string {
		return this.name;
	}
	SetEditing(editing: boolean):void {
		this.editing = editing;
		this.EditingSignal.dispatch(this, editing);
	}
	IsEditing():boolean {
		return this.editing;
	}
	protected checkDirty(fs:FileStat): boolean {
		switch (fs) {
		case FileStat.Exists:
			return false;
		case FileStat.Changed:
			// fallthrough
		case FileStat.Deleted:
			// fallthrough
		case FileStat.New:
			return true;
		case FileStat.NotExist:
			throw(new Error(`File ${this.Path()} doesn't seem to exist`);
		}
	}
	IsDirty(fc:FileContent):Promise<boolean> {
		return this.FS.Stat(this.name)
		.then(
			(fs)=>{
				return Promise.resolve(this.checkDirty(fs));
			}
		);
	}
	Save(t:string):Promise<FileStat> {
		return this.FS.Write(this.name, FileStat.Changed, t)
			.then(
				(fc)=>{
					this.DirtySignal.dispatch(this, this.checkDirty(fc.Stat));
					return Promise.Resolve<FileStat>(fc.Stat);
				}

			);
	}
	Read(t:string):Promise<FileContent> {
		return this.FS.Read(t);
	}
}