import {EBW} from './EBW';
import signals = require('signals');

let _repoFileModelCache = {};

interface RepoFileModelOptions {
	newFile?: boolean,
}
/**
 * RepoFileModel provides a wrapper around a file on the
 * server and a local copy of the file stored in the browser's
 * sessionStorage.
 * The RepoFileModel class has Dirty and Editing signals
 * that can be mapped to be notified when the file is editing or
 * when the file contents on the browser are Dirty, and should be 
 * updated to the server.
 * The RepoFileModel _should_ be somehow static for all
 * repo-path combinations, but at present it isn't, and it also
 * has a dependency upon the fileList object, which isn't great - I'm 
 * not entirely sure why this dependency exists. 
 */
export class RepoFileModel {
	protected DirtySignal: signals.Signal;
	protected EditingSignal : signals.Signal;
	protected editing: boolean;

	constructor(protected repoOwner:string,
	 protected repoName:string, 
	 protected path:string, 
	 protected options:RepoFileModelOptions={}) {
		let cacheKey = `${repoOwner}/${repoName}:/${path}`;
		let fm = _repoFileModelCache[cacheKey];
		if (fm) {
			return fm;
		}
		this.DirtySignal = new signals.Signal();
		this.EditingSignal = new signals.Signal();
		_repoFileModelCache[cacheKey] = this;
		return this;
	}
	Path() : string {
		return this.path;
	}
	storageKey() : string {
		return `${this.repoOwner}/${this.repoName}:${this.path}`;
	}
	SetEditing(editing: boolean):void {
		this.editing = editing;
		this.EditingSignal.dispatch(this, editing);
	}
	IsEditing():boolean {
		return this.editing;
	}
	IsDirty(t:string|boolean=false):boolean {
		if (this.options.newFile) {
			return true;
		}
		if (!t) {
			t = sessionStorage.getItem(this.storageKey());
		}
		let orig = sessionStorage.getItem(this.storageKey() + '-original');
		return (orig!=t);
	}
	Save(t:string|boolean=false) {
		if (!t) {
			t = sessionStorage.getItem(this.storageKey());
		}
		if (!this.IsDirty(t)) {
			return Promise.resolve(true);
		}
		return new Promise( (resolve,reject)=> {
			EBW.API().UpdateFile(this.repoOwner, this.repoName, this.path, t as string).then(
				(res)=>{
					sessionStorage.setItem(this.storageKey + '-original', t as string);
					this.SetText(t);
					this.options.newFile = false;					
					resolve(true);
				})
			.catch( err=>{
				EBW.Error(err);
				reject(err);
			});
		});
	}
	GetText() {
		let t = sessionStorage.getItem(this.storageKey());
		if (t) {
			return Promise.resolve(t);
		}
		if (this.options.newFile) {
			return Promise.resolve('');
		}

		return new Promise( (resolve,reject)=>{
			EBW.API().GetFileString(this.repoOwner, this.repoName, this.path).then(
				([text])=>{
					sessionStorage.setItem(this.storageKey() + '-original', text);
					resolve(text);
				},
				(err)=>{
					reject(err);
				});			
		});
	}
	SetText(t:string) : void {
		sessionStorage.setItem(this.storageKey(), t);
		this.DirtySignal.dispatch(this, this.IsDirty(t));
	}
	Original() : string {
		if (this.options.newFile) {
			return '';
		}
		return sessionStorage.getItem(this.storageKey() + '-original');
	}
}