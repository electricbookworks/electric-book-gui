import {AllFilesList} from './AllFilesList';
import {PrintListener} from './PrintListener';
import {RepoFileEditorCM} from './RepoFileEditorCM';
import {RepoEditorPage_NewFileDialog} from './RepoEditorPage_NewFileDialog';
import {RepoEditorPage_RenameFileDialog} from './RepoEditorPage_RenameFileDialog';
import {RepoFileModelCache} from './RepoFileModelCache';
import {EBW} from './EBW';
import {Volume} from './FS/Volume';
import {VolumeElement} from './VolumeElement';

import {FileContent,FileStat,FS} from './FS/FS';
import {FSNotify} from './FS/FSNotify';
import {FSSession} from './FS/FSSession';
import {FSRemote} from './FS/FSRemote';
import {FSReadCache} from './FS/FSReadCache';

import {FSFileList} from './FSFileList';
import {FSPrimeFromJS} from './FS/FSPrimeFromJS';

/**
 * RepoEditorPage is the JS controller for the page that allows
 * editing of a repo.
 */
export class RepoEditorPage {
	protected editor: RepoFileEditorCM;
	protected volume: VolumeElement;
	protected fileCache: RepoFileModelCache;

	protected FS: FSNotify;

	constructor(
		protected repoOwner:string, 
		protected repoName:string,
		filesList: HTMLElement,
		filesJson: any,
		protected proseIgnoreFunction: (name:string)=>boolean
	) {
		this.repoOwner = repoOwner;
		this.repoName = repoName;
		this.editor = undefined;
		this.editor = new RepoFileEditorCM(document.getElementById('editor'), {
			Rename: ():void=>{
				return;
			}
		});

		let remoteFS = new FSReadCache(new FSRemote(this.repoOwner, this.repoName));
		let localFS = new FSSession(`temp-rootf`, this.repoOwner, this.repoName);

		this.FS = new FSNotify(remoteFS);
		
		new FSFileList(filesList, this.editor, this.FS, this.proseIgnoreFunction);

		new RepoEditorPage_NewFileDialog(
			document.getElementById('repo-new-file'),
			this.FS,
			this.editor);
		new RepoEditorPage_RenameFileDialog(
			document.getElementById(`repo-rename-file`),
			this.FS,
			this.editor);
		
		FSPrimeFromJS(this.FS, filesJson);

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
		/**
		 * @TODO
		 * Need to catch any attempt to leave RepoEditorPage and
		 * check that the user has saved any changes.
		 */
	}
	static instantiate() {
		let el = document.getElementById(`repo-editor-page`);
		if (el) {
			console.error(`RepoEditorPage should be constructed directly to receive ProseIgnoreFunction`);
			debugger;
			console.log(`Instantiating RepoEditorPage`);
			let repoOwner = el.getAttribute('repo-owner');
			let repoName = el.getAttribute('repo-name');
			// let volume = new VolumeElement()
			// let allFilesList = document.querySelector(`[data-instance='AllFilesList']`);

			let filesList = document.querySelector(`[data-instance='AllFilesList']`);
			let primeFSel = document.getElementById(`volume-element`);
			let primeFSjs = JSON.parse(primeFSel.innerText);
			new RepoEditorPage(repoOwner, repoName, 
				filesList as HTMLElement,
				primeFSjs, 
				function(name:string) {
					return false;
				}
			);
		}
	}
}

window.RepoEditorPage = RepoEditorPage;
