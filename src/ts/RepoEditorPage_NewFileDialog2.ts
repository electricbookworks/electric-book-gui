import {EBW} from './EBW';
import {Eventify} from './Eventify';
import {RepoEditorPage_NewFileDialog as Template} from './Templates';
import {RepoFileEditorCM} from './RepoFileEditorCM2';
import {DialogEvents, FoundationRevealDialog as Dialog} from './FoundationRevealDialog';
import {FS} from './FS2/FS';
import {Context} from './Context';
import {File} from './FS2/File';
import {FileState} from './FS2/FileState';

import {FSFileEdit} from './FS/FSFileEdit';

import jQuery = require('jquery');

/**
 * RepoEditorPage_NewFileDialog displays a new file
 * dialog on the RepoPageEditor page.
 *
 */
export class RepoEditorPage_NewFileDialog extends Template {
	protected $el : any;
	protected dialog: Dialog;
	protected repoOwner: string;
	protected repoName: string;
	constructor(
		protected context:Context,
		protected openElement:HTMLElement, 
		protected FS:FS,
		protected editor: RepoFileEditorCM,
	) {
		super();
		document.body.appendChild(this.el);
		this.$el = jQuery(this.el);
		Eventify(this.el, {
			"click": (evt:any)=>{
				let filename = this.$.filename.value;
				if (filename.substr(0,1)!='/') {
					filename = "/" + filename ;
				}
				this.FS.FileState(filename)
				.then(
					(fs:FileState)=>{
						if (!(fs==FileState.Absent || fs==FileState.Deleted || fs==FileState.Undefined)) {
							EBW.Alert(`A file named ${filename} already exists`);
							return;							
						}
						this.FS.Write(filename, ``)
						.then(
							(f:File)=>{
								console.log(`Wrote file  `, f, ` to FS `, this.FS);
								this.dialog.Close();
								this.editor.setFile(f);
							}
						);
					});
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