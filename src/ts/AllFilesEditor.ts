import {File} from './File';
import {Directory} from './Directory';
import {Templates} from './Templates';
import {RepoFileEditLink} from './RepoFileEditLink';
import {RepoFileModel} from './RepoFileModel';

interface chooseFileCallback{
	(editor:AllFilesEditor, file:File):void
}

/**
 * AllFilesEditor is a control that allows the user to select
 * any file from the repo for editing.
 */
export class AllFilesEditor {
	protected el : Templates.EL.AllFilesEditor;
	protected $ : Templates.R.AllFilesEditor;
	constructor(
		protected repoOwner:string, 
		protected repoName:string, 
		parent:HTMLElement, 
		protected dir:Directory, 
		protected chooseFileCallback:chooseFileCallback) 
	{
		if (!parent) {
			console.log(`NO parent for AllFilesEditor`);
			return;
		}

		[this.el, this.$] = Templates.T.AllFilesEditor();
		for (let f of dir.FileNamesOnly()) {
			if ("."!=f[0]) {
				let model = new RepoFileModel(this.repoOwner, this.repoName, f);
				new RepoFileEditLink(this.el, model,
					(_src, file)=>{
						this.chooseFileCallback(this, file);
					}
				);
			}
		}
		parent.appendChild(this.el);
	}
}