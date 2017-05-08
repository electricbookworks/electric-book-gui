import {EBW} from './EBW';
import {Eventify} from './Eventify';
import {Volume} from './FS/Volume';
import {RepoEditorPage_NewFileDialog as Template} from './Templates';
import {RepoFileModel} from './RepoFileModel';
import {RepoFileEditorCM} from './RepoFileEditorCM';

import Foundation = require('foundation-sites');
import jQuery = require('jquery');

/**
 * RepoEditorPage_NewFileDialog displays a new file
 * dialog on the RepoPageEditor page.
 *
 */
export class RepoEditorPage_NewFileDialog extends Template {
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
		Foundation.Reveal(this.$el);
		Eventify(this.el, {
			"click": (evt:any)=>{
				let filename = this.$.filename.value;
				if(this.volume.Exists(filename)) {
					EBW.Alert(`A file named ${filename} already exists`);
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
			"change": (evt:any)=>{

			}
		});
		openElement.addEventListener('click', (evt:any)=>{
			evt.preventDefault();
			evt.stopPropagation();
			this.$el.foundation('open');
		});
		this.$el.bind('open.zf.reveal', (evt:any)=>{
			this.$.filename.value = '';
			this.$.filename.focus();
		});
	}
}