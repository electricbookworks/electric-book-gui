/**
 * RepoEditorPage is the JS controller for the page that allows
 * editing of a repo.
 */
class RepoEditorPage {
	constructor(repo) {
		this.repo = repo;
		this.editor = new RepoFileEditorCM(document.getElementById('editor'));
		this.files = new RepoFileList(document.getElementById('files'),repo, this.editor);
		new PullRequestList(document.getElementById('pull-request-list'), repo);
		window.addEventListener('beforeunload', evt=> {
			// transfer editor to file text
			this.editor.setFile(null);
			if (this.files.IsDirty()) {
				evt.returnValue='confirm';
				evt.stopPropagation();
			}
		});
		document.getElementById('repo-commit').addEventListener('click', evt=>{
			// @TODO Need to check that all files are saved - or at least prompt user...
			evt.preventDefault();
			evt.stopPropagation();
			let msg = prompt(`Enter the commit message`);
			if (msg) {
				EBW.Toast(`Committing ${msg}`);
				EBW.API().Commit(this.repo, msg).then(
					()=>{
						EBW.Toast(`Changes committed: ${msg}`);
					}
				).catch( EBW.Error );
			}
		});
		document.getElementById(`repo-print`).addEventListener('click', evt=>{
			evt.preventDefault(); evt.stopPropagation();
			EBW.Toast(`Printing in progress...`);
			new PrintListener(this.repo, `book`);
		});
	}

}

window.RepoEditorPage = RepoEditorPage;