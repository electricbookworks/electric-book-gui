import {AllFilesList} from './AllFilesList';
import {PrintListener} from './PrintListener';
import {RepoFileEditorCM} from './RepoFileEditorCM';
import {RepoEditorPage_NewFileDialog} from './RepoEditorPage_NewFileDialog';
import {RepoFileModelCache} from './RepoFileModelCache';
import {EBW} from './EBW';
import {Volume} from './FS/Volume';
import {VolumeElement} from './VolumeElement';

/**
 * RepoEditorPage is the JS controller for the page that allows
 * editing of a repo.
 */
export class RepoEditorPage {
	protected editor: RepoFileEditorCM;
	protected volume: VolumeElement;
	protected fileCache: RepoFileModelCache;

	constructor(
		protected repoOwner:string, 
		protected repoName:string,
		allFilesListEl: HTMLElement
	) {
		this.repoOwner = repoOwner;
		this.repoName = repoName;
		this.editor = undefined;
		//this.editor = new RepoFileEditorCM(document.getElementById('editor'), );
		this.volume = new VolumeElement(document.getElementById(`volume-element`));
		this.fileCache = RepoFileModelCache.initialize(this.repoOwner, this.repoName);

		new AllFilesList(allFilesListEl, repoOwner, repoName, this.volume, this.editor, this.fileCache);

		new RepoEditorPage_NewFileDialog(
			this.repoOwner,
			this.repoName,
			document.getElementById('repo-new-file'),
			this.volume,
			this.editor);
		
		this.volume.Load();

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
		let el = document.getElementById(`repo-editor-page`);
		if (el) {
			console.log(`Instantiating RepoEditorPage`);
			let repoOwner = el.getAttribute('repo-owner');
			let repoName = el.getAttribute('repo-name');
			let volumeEL = document.getElementById(`volume-element`);
			let volume = new VolumeElement()
			let allFilesList = document.querySelector(`[data-instance='AllFilesList']`);

			new RepoEditorPage(repoOwner, repoName, document.querySelector(`[data-instance='AllFilesList']`) as HTMLElement);
		}
	}
}