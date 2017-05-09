import {EBW} from './EBW';
import {Eventify} from './Eventify';
import {RepoEditorPage_NewFileDialog as Template} from './Templates';
import {RepoFileModel} from './RepoFileModel';
import {RepoFileEditorCM} from './RepoFileEditorCM';
import {DialogEvents, FoundationRevealDialog as Dialog} from './FoundationRevealDialog';
import {FS,FileStat,FileContent} from './FS/FS';
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
		openElement:HTMLElement, 
		protected FS:FS,
		protected editor: RepoFileEditorCM,
	) {
		super();
		[this.repoOwner, this.repoName] = this.FS.RepoOwnerName();
		document.body.appendChild(this.el);
		this.$el = jQuery(this.el);
		Eventify(this.el, {
			"click": (evt:any)=>{
				let filename = this.$.filename.value;
				this.FS.Stat(filename)
				.then(
					(fs:FileStat)=>{
						if (!(fs==FileStat.NotExist || fs==FileStat.Deleted)) {
							EBW.Alert(`A file named ${filename} already exists`);
							return;							
						}
						this.FS.Write(filename, FileStat.New, ``)
						.then(
							(fc:FileContent)=>{
								this.dialog.Close();
								let edit = new FSFileEdit(fc, FS);
								this.editor.setFile(edit);
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