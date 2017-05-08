import {EBW} from './EBW';
import {Eventify} from './Eventify';
import {DialogEvents, FoundationRevealDialog as Dialog} from './FoundationRevealDialog';
import {RepoEditorPage_RenameFileDialog as Template} from './Templates';
import {RepoFileModel} from './RepoFileModel';
import {RepoFileEditorCM} from './RepoFileEditorCM';
import {Volume} from './FS/Volume';

import jQuery = require('jquery');

/**
 * RepoEditorPage_RenameFileDialog displays a Rename file
 * dialog on the RepoPageEditor page.
 */
export class RepoEditorPage_RenameFileDialog extends Template {
	protected $el : any;
	protected dialog : Dialog;
	constructor(
		protected repoOwner:string,
		protected repoName:string,
		openElement:HTMLElement, 
		protected volume:Volume,
		protected editor: RepoFileEditorCM,
	) {
		super();
		Eventify(this.el, {
			"click": (evt:any)=>{
				let filename = this.$.filename.value;
				if(this.volume.Exists(filename)) {
					EBW.Alert(`A file named ${filename} already exists`);
					return;
				}
				this.volume.Write(filename);
				this.volume.Purge(filename);
				this.dialog.Close();
				let m = new RepoFileModel(
					this.repoOwner,
					this.repoName, 
					this.volume.Get(filename),
					{newFile:true});
				this.editor.setFile(m);				
			},
			"change": (evt:any)=>{

			}
		});
		this.dialog = new Dialog(openElement, this.el);
		this.dialog.Events.add( (act:DialogEvents)=>{
			switch (act) {
				case DialogEvents.Opened:
					this.$.filename.value = '';
					this.$.filename.focus();
					break;
				case DialogEvents.Closed:
					break;
			}
		});		
	}
}