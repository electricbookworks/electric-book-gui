class AllFilesList {
	constructor(repoOwner, repoName, editor) {
		this.editor = editor;
		this.repoOwner = repoOwner;
		this.repoName = repoName;
		this.api = EBW.API();
		this.api.ListAllRepoFiles(repoOwner, repoName)
		.then( this.api.flatten(
			js=>{
				let d = Directory.FromJS(false, js);
				new AllFilesEditor(
					document.getElementById(`all-files-editor`),
					d, 
					(_source, file)=>{
						let rfm = new RepoFileModel(
							this.repoOwner, this.repoName,
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
