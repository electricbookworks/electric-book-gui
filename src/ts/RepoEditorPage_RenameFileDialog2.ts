import {EBW} from './EBW';
import {Eventify} from './Eventify';
import {DialogEvents, FoundationRevealDialog as Dialog} from './FoundationRevealDialog';
import {RepoEditorPage_RenameFileDialog as Template} from './Templates';
import {RepoFileEditorCM} from './RepoFileEditorCM';

//import {FS,FileContent, FileStat} from './FS/FS';
//import {FSFileEdit} from './FS/FSFileEdit';
import {FS} from './FS2/FS';
import {FileState} from './FS2/FileState';
import {File} from './FS2/File';

import jQuery = require('jquery');

/**
 * RepoEditorPage_RenameFileDialog displays a Rename file
 * dialog on the RepoPageEditor page.
 */
export class RepoEditorPage_RenameFileDialog extends Template {
	protected $el : any;
	protected dialog : Dialog;
	constructor(
		protected context:Context,
		protected openElement:HTMLElement, 
		protected editor: RepoFileEditorCM
	) {
		super();
		Eventify(this.el, {
			"click": (evt:any)=>{
				let toName = this.$.filename.value;
				this.editor.Rename(toName)
				.then(
					()=>{
						this.dialog.Close();
					})
				.catch(EBW.Error);
			},
			"change": (evt:any)=>{

			}
		});
		this.dialog = new Dialog(openElement, this.el);
		this.dialog.Events.add( (act:DialogEvents)=>{
			switch (act) {
				case DialogEvents.Opened:
					this.$.filename.value = this.editor.File().Name();
					this.$.filename.focus();
					this.$.current_name.innerText = this.editor.File().Name();
					break;
				case DialogEvents.Closed:
					break;
			}
		});
	}
}