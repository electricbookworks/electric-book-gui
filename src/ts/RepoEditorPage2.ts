import {ControlTag} from './ControlTag';
import {Context} from './Context';
import {EBW} from './EBW';
import {PrintListener} from './PrintListener';
import {RepoFileEditorCM} from './RepoFileEditorCM2';
import {RepoEditorPage_NewFileDialog} from './RepoEditorPage_NewFileDialog2';
import {RepoEditorPage_RenameFileDialog} from './RepoEditorPage_RenameFileDialog2';

// import {FileContent,FileStat,FS} from './FS/FS';
// import {FSNotify} from './FS/FSNotify';
// import {FSOverlay} from './FS/FSOverlay';
// import {FSRemote} from './FS/FSRemote';
// import {FSReadCache} from './FS/FSReadCache';
// import {FSSession} from './FS/FSSession';

import {File} from './FS2/File';
import {FileState} from './FS2/FileState';
import {FS} from './FS2/FS';
import {MemFS} from './FS2/MemFS';
import {WorkingDirFS} from './FS2/WorkingDirFS';
import {NotifyFS} from './FS2/NotifyFS';
import {ReadCacheFS} from './FS2/ReadCacheFS';

// import {FSPrimeFromJS} from './FS/FSPrimeFromJS';

// import {FSFileList} from './FSFileList';
import {FileSystemConnector} from './FileSystemConnector';
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
		filesListElement: HTMLElement,
		filesJson: any,
		protected proseIgnoreFunction: (name:string)=>boolean,
		filesAndHashes: Array<Array<string>>
	) {
		sessionStorage.clear();

		// This is my FileSystem stack, which will ensure that edits are stored in-browser,
		// and that we can cache reads from the WorkingDirectory.
		let repoKey = ":/" + context.Username + ":" + context.RepoOwner + ":" + context.RepoName + "/";
		let wdFS = new WorkingDirFS(this.context, null);
		let readCacheFS = new ReadCacheFS(SHA1(`cache` + repoKey), wdFS);
		let memFS = new MemFS(SHA1(`mem`+ repoKey), readCacheFS);
		this.FS = new NotifyFS(memFS);

		this.editor = undefined;
		this.editor = new RepoFileEditorCM(
			context.RepoOwner, context.RepoName,
			document.getElementById('editor'), {
			Rename: ():void=>{
				return;
			}},
			this.FS
		);

		new FileSystemConnector(this.context, 
			filesListElement, 
			this.editor, 
			this.FS, 
			this.proseIgnoreFunction,
			filesJson,
			filesAndHashes);

		new RepoEditorPage_NewFileDialog(
			this.context,
			document.getElementById('repo-new-file'),
			this.FS,
			this.editor);
		new RepoEditorPage_RenameFileDialog(
			this.context,
			document.getElementById(`editor-rename-button`),
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
