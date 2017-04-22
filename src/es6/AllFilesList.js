class AllFilesList {
	constructor(repo, editor) {
		this.editor = editor;
		this.repo = repo;
		this.api = EBW.API();
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
	}
}
