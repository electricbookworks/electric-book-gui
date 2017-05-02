import {EBW} from './EBW';
import {Eventify} from './Eventify';
import {Volume} from './Volume';
import {RepoPageEditor_NewFileDialog as Template} from './Templates';
import {RepoFileModel} from './RepoFileModel';
import {RepoFileEditorCM} from './RepoFileEditorCM';

import jQuery = require('jquery');

/**
 * RepoPageEditor_NewFileDialog displays a new file
 * dialog on the RepoPageEditor page.
 *
 * It expects the dialog (a Foundation Reveal
 * div) to be already exposed on the page with
 * id 'repo-new-file-dialog'.
 */
export class RepoPageEditor_NewFileDialog extends Template {
	protected $el : any;
	constructor(
		protected repoOwner:string,
		protected repoName:string,
		openElement:HTMLElement, 
		protected volume:Volume,
		protected editor: RepoFileEditorCM,
	) {
		super();
		document.body.appendChild(this.el);
		this.$el = jQuery(this.el);
		new Foundation.Reveal(this.$el);
		Eventify(this.el, {
			"click": (evt)=>{
				let filename = this.$.filename.value;
				if(this.volume.Exists(filename)) {
					alert(`A file named ${filename} already exists`);
					return;
				}
				this.volume.Write(filename);
				this.$el.foundation('close');
				let m = new RepoFileModel(
					this.repoOwner,
					this.repoName, 
					this.volume.Get(filename),
					{newFile:true});
				this.editor.setFile(m);				
			},
			"change": (evt)=>{

			}
		});
		openElement.addEventListener('click', (evt)=>{
			evt.preventDefault();
			evt.stopPropagation();
			this.$el.foundation('open');
		});
		this.$el.bind('open.zf.reveal', (evt)=>{
			this.$.filename.value = '';
			this.$.filename.focus();
		});
	}
}