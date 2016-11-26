class RepoEditorPage {
	constructor(repo) {
		this.editor = new RepoFileEditorCM(document.getElementById('editor'));
		this.files = new RepoFileList(document.getElementById('files'),repo, this.editor);
		new PullRequestList(document.getElementById('pull-requests'), repo);
		window.addEventListener('beforeunload', evt=> {
			// transfer editor to file text
			this.editor.setFile(null);
			if (this.files.IsDirty()) {
				evt.returnValue='confirm';
				evt.stopPropagation();
			}
		});
	}

}

window.RepoEditorPage = RepoEditorPage;