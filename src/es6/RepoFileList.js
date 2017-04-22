class RepoFileList {
	constructor(parent, repo, editor) {
		new AllFilesList(repo, editor);
		if (!parent) {
			console.log(`Created RepoFileList with null parent`);
			return;
		}
		this.parent = parent;
		this.repo = repo;
		this.editor = editor;

		this.files = [];
		[this.el, this.$] = DTemplate(`RepoFileList`);
		Eventify(this.el, {
			'click-new': function(evt) {
				evt.preventDefault();
				let name = prompt('Enter new filename:');
				if (!name) return;
				let file = new RepoFileModel(this.repo, `book/text/${name}`, {"newFile":true});
				this.files.push(file);
				new RepoFileEditLink(this.$.fileList, file, (x,file)=>{
					this.editor.setFile(file);
				});
				this.editor.setFile(file);
			}
		}, this);

		this.api = EBW.API();

		this.api.ListFiles(repo, `^book/text/.*`)
		.then( this.api.flatten(
			files=>{
				for (let f of files) {
					let file = new RepoFileModel(repo, f);
					this.files.push(file);
					new RepoFileEditLink(this.$.fileList, file, (x,file) =>{
						this.editor.setFile(file);
					});
				}
		}))
		.catch( (err)=>{
			EBW.Error(err);
		});
		
		this.parent.appendChild(this.el);
	}
	IsDirty() {
		if (!this.files) {
			return false;
		}
		for (let f of this.files) {
			if (f.IsDirty()) {
				return true;
			}
		}
		return false;
	}
}

window.RepoFileList = RepoFileList;