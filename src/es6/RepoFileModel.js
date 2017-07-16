let _repoFileModelCache = {};

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
class RepoFileModel {
	constructor(repoOwner, repoName, path, args={}) {
		let cacheKey = `${repoOwner}/${repoName}:/${path}`;
		let fm = _repoFileModelCache[cacheKey];
		if (fm) {
			return fm;
		}
		this.repoOwner = repoOwner;
		this.repoName = repoName;
		this.path = path;
		this.DirtySignal = new signals.Signal();
		this.EditingSignal = new signals.Signal();
		this.args = args;
		_repoFileModelCache[cacheKey] = this;
		return this;
	}
	get storageKey() {
		return `${this.repoOwner}/${this.repoName}:${this.path}`;
	}
	SetEditing(editing) {
		this.editing = editing;
		this.EditingSignal.dispatch(this, editing);
	}
	IsEditing() {
		return this.editing;
	}
	IsDirty(t=false) {
		if (this.args.newFile) {
			return true;
		}
		if (!t) {
			t = sessionStorage.getItem(this.storageKey);
		}
		let orig = sessionStorage.getItem(this.storageKey + '-original');
		return (orig!=t);		
	}
	Save(t=false) {
		if (!t) {
			t = sessionStorage.getItem(this.storageKey);
		}
		if (!this.IsDirty(t)) {
			return Promise.resolve(true);
		}
		return new Promise( (resolve,reject)=> {
			EBW.API().UpdateFile(this.repoOwner, this.repoName, this.path, t).then(
				(res)=>{
					sessionStorage.setItem(this.storageKey + '-original', t);
					this.SetText(t);
					this.args.newFile = false;					
					resolve(true);
				})
			.catch( err=>{
				EBW.Error(err);
				reject(err);
			});
		});
	}
	GetText() {
		let t = sessionStorage.getItem(this.storageKey);
		if (t) {
			return Promise.resolve(t);
		}
		if (this.args.newFile) {
			return Promise.resolve('');
		}

		return new Promise( (resolve,reject)=>{
			EBW.API().GetFileString(this.repoOwner, this.repoName, this.path).then(
				(res)=>{
					let text = res[0];
					sessionStorage.setItem(this.storageKey + '-original', text);
					resolve(text);
				},
				(err)=>{
					reject(err);
				});			
		});
	}
	SetText(t) {
		sessionStorage.setItem(this.storageKey, t);
		this.DirtySignal.dispatch(this, this.IsDirty(t));
	}
	Original() {
		if (this.args.newFile) {
			return '';
		}
		return sessionStorage.getItem(this.storageKey + '-original');
	}
}