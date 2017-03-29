class RepoFileModel {
	constructor(repo, path, fileList, args={}) {
		this.repo = repo;
		this.path = path;
		this.fileList = fileList;
		this.DirtySignal = new signals.Signal();
		this.EditingSignal = new signals.Signal();
		this.args = args;
	}
	get storageKey() {
		return `${this.repo}:${this.path}`;
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
			EBW.API().UpdateFile(this.repo, this.path, t).then(
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
			EBW.API().GetFileString(this.repo, this.path).then(
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