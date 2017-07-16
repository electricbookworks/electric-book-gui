class RepoFileList {
	constructor(parent, repoOwner, repoName, editor) {
		new AllFilesList(repoOwner, repoName, editor);
		if (!parent) {
			console.log(`Created RepoFileList with null parent`);
			return;
		}
		this.parent = parent;
		this.repoOwner = repoOwner;
		this.repoName = repoName;
		this.editor = editor;

		this.files = [];
		[this.el, this.$] = DTemplate(`RepoFileList`);
		Eventify(this.el, {
			'click-new': function(evt) {
				evt.preventDefault();
				// TODO Convert this to EBW.Prompt
				EBW.Prompt(`Enter new filename:`).
				then(
					(name)=> {
						if (!name) return;
						let file = new RepoFileModel(this.repoOwner, this.repoName, `book/text/${name}`, {"newFile":true});
						this.files.push(file);
						new RepoFileEditLink(this.$.fileList, file, (x,file)=>{
							this.editor.setFile(file);
						});
						this.editor.setFile(file);
					}
					);
			}
		}, this);

		this.api = EBW.API();

		this.api.ListFiles(repoOwner, repoName, `^book/text/.*`)
		.then( this.api.flatten(
			files=>{
				for (let f of files) {
					let file = new RepoFileModel(repoOwner, repoName, f);
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