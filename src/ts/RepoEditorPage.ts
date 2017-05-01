import {AllFilesList} from './AllFilesList';
import {PrintListener} from './PrintListener';
import {RepoFileEditorCM} from './RepoFileEditorCM';
import {EBW} from './EBW';

/**
 * RepoEditorPage is the JS controller for the page that allows
 * editing of a repo.
 */
export class RepoEditorPage {
	protected editor: RepoFileEditorCM;

	constructor(
		protected repoOwner:string, 
		protected repoName:string,
		allFilesListEl: HTMLElement
	) {
		this.repoOwner = repoOwner;
		this.repoName = repoName;
		this.editor = new RepoFileEditorCM(document.getElementById('editor'));
		new AllFilesList(allFilesListEl, repoOwner, repoName, this.editor);

		//new PullRequestList(document.getElementById('pull-request-list'), repo);
		// window.addEventListener('beforeunload', evt=> {
		// 	// transfer editor to file text
		// 	this.editor.setFile(null);
		// 	if (this.files.IsDirty()) {
		// 		evt.returnValue='confirm';
		// 		evt.stopPropagation();
		// 	}
		// });
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
	static instantiate() {
		let el = document.querySelector(`[data-instance="RepoEditorPage"]`);
		if (el) {
			console.log(`Instnatiating RepoEditorPage`);
			let repoOwner = el.getAttribute('repo-owner');
			let repoName = el.getAttribute('repo-name');
			let allFilesList = document.querySelector(`[data-instace='AllFilesList']`);
			new RepoEditorPage(repoOwner, repoName, document.querySelector(`[data-instance='AllFilesList']`) as HTMLElement);
		}
	}
}