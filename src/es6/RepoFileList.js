class RepoFileList {
	constructor(parent, repo, editor) {
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
		
		this.api.ListAllRepoFiles(repo)
		.then( this.api.flatten(
			js=>{
				let d = Directory.FromJS(false, js);
				new AllFilesEditor(
					document.getElementById(`all-files-editor`),
					d, 
					(_source, file)=>{
						let rfm = new RepoFileModel(
							this.repo,
							file,							
							{ newFile: false }
							);
						this.editor.setFile(rfm);
				});
			}
		))
		.catch( EBW.Error );
		this.parent.appendChild(this.el);
	}
	IsDirty() {
		for (let f of this.files) {
			if (f.IsDirty()) {
				return true;
			}
		}
		return false;
	}
}

window.RepoFileList = RepoFileList;