import {EBW} from '../EBW';
import {FS,FileStat,FileContent} from './FS';

import signals = require('signals');

/**
 * FSFileEdit is a wrapper around a file that is being
 * edited.
 */
export class FSFileEdit {
	public DirtySignal: signals.Signal;
	public EditingSignal : signals.Signal;
	protected editing: boolean;

	constructor(
		protected fc:FileContent,
		protected FS:FS) 
	{
		this.DirtySignal = new signals.Signal();
		this.EditingSignal = new signals.Signal();
	}
	Rename(toPath:string):Promise<[FileContent,FileContent]> {
		return this.FS.Rename(this.fc.Name,toPath)
		.then(
			([fOld, fNew]:[FileContent,FileContent])=>{
				this.fc = fNew;
				this.signalDirty();
				return Promise.resolve<[FileContent,FileContent]>([fOld, fNew]);
			});
	}
	Remove(): Promise<FileContent> {
		return this.FS.Remove(this.fc.Name)
		.then(
			(fc:FileContent)=>{
				this.fc = fc;
				this.signalDirty();
				return Promise.resolve<FileContent>(fc);
			});
	}
	Name() : string {
		return this.fc.Name;
	}
	SetEditing(editing: boolean):void {
		this.editing = editing;
		this.EditingSignal.dispatch(this, editing);
	}
	IsEditing():boolean {
		return this.editing;
	}
	IsDirty():Promise<boolean> {
		return this.FS.IsDirty(this.fc.Name);
	}
	protected signalDirty() {
		this.IsDirty().then(
			(dirty:boolean)=>{
				this.DirtySignal.dispatch(this, dirty);
			})
	}
	Save(t:string):Promise<FileContent> {
		return this.FS.Write(this.fc.Name, FileStat.Changed, t)
		.then(
			(fc:FileContent)=>{
				this.fc = fc;
				this.signalDirty();
				return Promise.resolve<FileContent>(fc);
			});
	}
	GetText():Promise<string> {
		return this.FS.Read(this.fc.Name)
		.then(
			(fc:FileContent)=>{
				console.log(`FSFileEdit.FS.Read returned `, fc);
				this.fc = fc;
				return Promise.resolve<string>(fc.Content);
			});
	}
	SetText(t:string) : Promise<FileContent> {
		return this.FS.Write(this.fc.Name, FileStat.Changed, t)
		.then(
			(fc:FileContent)=>{
				this.fc = fc;
				this.signalDirty();
				return Promise.resolve<FileContent>(fc);
			});
	}
}