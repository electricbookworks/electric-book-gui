/**
 * RepoEditorPage is the JS controller for the page that allows
 * editing of a repo.
 */
class RepoEditorPage {
	constructor(repoOwner, repoName) {
		this.repoOwner = repoOwner;
		this.repoName = repoName;
		this.editor = new RepoFileEditorCM(document.getElementById('editor'));
		this.files = new RepoFileList(document.getElementById('files'), repoOwner, repoName, this.editor);
		//new PullRequestList(document.getElementById('pull-request-list'), repo);
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
			EBW.Prompt(`Enter the commit message:`).then(
				(msg)=> {
					if (msg) {
						EBW.Toast(`Committing ${msg}`);
						EBW.API().Commit(this.repoOwner, this.repoName, msg).then(
							()=>{
								EBW.Toast(`Changes committed: ${msg}`);
							}
						).catch( EBW.Error );
					}
				}
			);
		});
		document.getElementById(`repo-print`).addEventListener('click', evt=>{
			evt.preventDefault(); evt.stopPropagation();
			console.log(`Starting printing...`);
			EBW.Toast(`Printing in progress...`);
			new PrintListener(this.repoOwner, this.repoName, `book`);
		});
		document.getElementById(`repo-jekyll`).addEventListener(`click`, evt=>{
			evt.preventDefault(); evt.stopPropagation();
			let l = document.location;
			let jekyllUrl = `${l.protocol}//${l.host}/jekyll/${this.repoOwner}/${this.repoName}/`;
			console.log(`URL = ${jekyllUrl}`);
			window.open(jekyllUrl, `${this.repoOwner}-${this.repoName}-jekyll`);
		});
	}

}

window.RepoEditorPage = RepoEditorPage;