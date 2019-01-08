import {ControlTag} from './ControlTag';
import {Context} from './Context';
import {EBW} from './EBW';
import {PrintListener} from './PrintListener';
import {RepoFileEditorCM} from './RepoFileEditorCM';
import {RepoEditorPage_NewFileDialog} from './RepoEditorPage_NewFileDialog';
import {RepoEditorPage_RenameFileDialog} from './RepoEditorPage_RenameFileDialog';

import {FileContent,FileStat,FS} from './FS/FS';
import {FSNotify} from './FS/FSNotify';
import {FSOverlay} from './FS/FSOverlay';
import {FSRemote} from './FS/FSRemote';
import {FSReadCache} from './FS/FSReadCache';
import {FSSession} from './FS/FSSession';

import {FSFileList} from './FSFileList';
import {FSFileTree} from './FSFileTree';
import {FSPrimeFromJS} from './FS/FSPrimeFromJS';
import {SHA1} from './FS2/SHA1';

/**
 * RepoEditorPage is the JS controller for the page that allows
 * editing of a repo.
 *
 */
export class RepoEditorPage {
	protected editor: RepoFileEditorCM;
	protected FS: FSNotify;

	constructor(
		protected context: Context,
		filesList: HTMLElement,
		filesJson: any,
		protected proseIgnoreFunction: (name:string)=>boolean
	) {
		console.log(`filesList= `, filesList);
		let test="This is a test";
		console.log(`sha1(${test}) = ` , SHA1(test));
		sessionStorage.clear();
		this.editor = undefined;
		this.editor = new RepoFileEditorCM(
			context.RepoOwner, context.RepoName,
			document.getElementById('editor'), {
			Rename: ():void=>{
				return;
			}
		});

		let remoteFS = new FSReadCache(new FSRemote(this.context.RepoOwner, this.context.RepoName));
		let localFS = new FSSession(`temp-rootf`, this.context.RepoOwner, this.context.RepoName);
		let overlayFS = new FSOverlay(remoteFS, localFS);
		this.FS = new FSNotify(overlayFS);
		
		new FSFileTree(this.context, filesList, this.editor, this.FS, this.proseIgnoreFunction);

		new RepoEditorPage_NewFileDialog(
			document.getElementById('repo-new-file'),
			this.FS,
			this.editor);
		new RepoEditorPage_RenameFileDialog(
			document.getElementById(`editor-rename-button`),
			this.FS,
			this.editor);

		new ControlTag(document.getElementById(`files-show-tag`),
			(showing:boolean)=>{
				document.getElementById(`new-editor-files-nav`)
				.style.width = showing ? "20%":"0px";
				document.getElementById(`repo-file-actions`)
				.style.visibility = showing ? `visible` : `hidden`;

				let f = document.getElementById(`page-footer`);
				f.style.display = showing ? 'flex' : 'none';
			});

		
		FSPrimeFromJS(this.FS, filesJson);

		document.getElementById(`repo-print-printer`).addEventListener('click', evt=>{
			evt.preventDefault(); evt.stopPropagation();
			EBW.Toast(`Creating your PDF. We'll open it in a new tab when it's ready.`);
			new PrintListener(this.context.RepoOwner, this.context.RepoName, `book`, `print`);
		});
		document.getElementById(`repo-print-screen`).addEventListener(`click`, evt=>{
			evt.preventDefault(); evt.stopPropagation();
			EBW.Toast(`Creating your PDF. We'll open it in a new tab when it's ready.`);
			new PrintListener(this.context.RepoOwner, this.context.RepoName, `book`, `screen`);
		});
		document.getElementById(`repo-jekyll`).addEventListener(`click`, evt=>{
			evt.preventDefault(); evt.stopPropagation();
			let l = document.location;
			let jekyllUrl = `${l.protocol}//${l.host}/jekyll-restart/` + 
				`${this.context.RepoOwner}/${this.context.RepoName}/`;
			console.log(`URL = ${jekyllUrl}`);
			window.open(jekyllUrl, `${this.context.RepoOwner}-${this.context.RepoName}-jekyll`);
		});
		/**
		 * @TODO
		 * Need to catch any attempt to leave RepoEditorPage and
		 * check that the user has saved any changes.
		 */
	}
}

window.RepoEditorPage = RepoEditorPage;
