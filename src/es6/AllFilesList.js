class AllFilesList {
	constructor(repoOwner, repoName, editor) {
		this.editor = editor;
		this.repoOwner = repoOwner;
		this.repoName = repoName;
		this.api = EBW.API();
		let el = document.getElementById(`all-files-editor`);
		if (el.hasAttribute(`data-files`)) {
			this.renderFilesList(JSON.parse(el.getAttribute(`data-files`)));
		} else {
			this.api.ListAllRepoFiles(repoOwner, repoName)
			.then( this.api.flatten(
				this.renderFilesList, this
			))
			.catch( EBW.Error );
		}
	}
	renderFilesList(js) {
		let d = Directory.FromJS(false, js);
		new AllFilesEditor(
			this.repoOwner, this.repoName,
			document.getElementById(`all-files-editor`),
			d, 
			(_source, file)=>{
				this.editor.setFile(file);
		});
	}
}
