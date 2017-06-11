import {AddToParent} from '../DOM';
import {Context} from '../Context';
import {EBW} from '../EBW';
import {File} from './File';
import {MergeEditorAction, MergeEditorControlBar} from './MergeEditorControlBar';
import jQuery = require('jquery');

import signals = require('signals');

// MergeEditor controls a Mergely class
//
export class MergeEditor {
	protected mergelyDiv: HTMLDivElement;
	public Listen : signals.Signal;
	protected file:File;
	protected editLeft = false;
	protected editBoth = true;

	constructor(
		protected context:Context,
		protected parent:HTMLElement
		) 
	{
		this.Listen = new signals.Signal();
		let controlBar = new MergeEditorControlBar();
		controlBar.Listen.add(this.controlAction, this);
	}
	controlAction(act:MergeEditorAction) {
		switch(act) {
			case MergeEditorAction.Save:
				this.file.SaveWorkingContent(this.getText())
				.then(
					()=>{
						EBW.Toast(`Saved ${this.file.Path()}`);
					})
				.catch(EBW.Error);
				break;
			case MergeEditorAction.Delete:
				break;
			case MergeEditorAction.Resolve:
				this.file.CommitWorkingContent(this.getText())
				.then( 
					()=>{
						EBW.Toast(`Resolved ${this.file.Path()}.`);
					})
				.catch(EBW.Error);
				break;
			case MergeEditorAction.RevertOur:
				this.file.OurContent()
				.then(
					(s:string)=>{
						this.setText(s);
					})
				.catch(EBW.Error);
				break;
			case MergeEditorAction.RevertTheir:
				this.file.TheirContent()
				.then(
					(s:string)=>{
						this.setText(s);
					})
				.catch( EBW.Error );
				break;
			case MergeEditorAction.RevertGit:
		}
	}
	getText() : string {
		if (this.editLeft) {
			return this.getLHS();
		}
		return this.getRHS();
	}
	setText(s:string) {
		if (this.editLeft) {
			this.setLHS(s);
		} else {
			this.setRHS(s);
		}
	}

	getLHS() : string {
		let cm = jQuery(this.mergelyDiv).mergely('cm', 'lhs');
		return cm.getDoc().getValue();
	}
	getRHS() : string {
		let cm  = jQuery(this.mergelyDiv).mergely('cm', 'rhs');
		return cm.getDoc().getValue();
	}
	setLHS(s:string) {
		let cm = jQuery(this.mergelyDiv).mergely('cm', 'lhs');
		cm.getDoc().setValue(s);
	}
	setRHS(s:string) {
		let cm = jQuery(this.mergelyDiv).mergely('cm', 'rhs');
		cm.getDoc().setValue(s);
	}
	// Merge starts merging a file.
	Merge(file:File) : void {
		// First check if we're currently editing, and prompt to save
		// if we have made changes.

		let p = file.FetchContent()
		.then(
			()=>{
				return Promise.all( [file.WorkingContent(), file.TheirContent()] );
			}
		)
		.then(
			(args:string[]) => {
				let [working,their] = [ args[0], args[1] ];				
				this.file = file;
				this.parent.textContent = ``;
				this.mergelyDiv = document.createElement(`div`) as HTMLDivElement;
				this.parent.appendChild(this.mergelyDiv);
				let m = jQuery(this.mergelyDiv);
				m.mergely(
				{
					cmsettings : {
						readOnly: false, 
						lineNumbers: true,
						lineWrapping: true,
					},
					lhs_cmsettings: {
						readOnly: (!this.editBoth) && (!this.editLeft)
					},
					rhs_cmsettings: {
						readOnly: (!this.editBoth) && this.editLeft
					},
					// lhs_cmsettings: {
					// 	wrap_lines: true,
					// },
					// autoresize: true,
					editor_height: "100%",
					// wrap_lines: true,
					lhs: function(setValue:(v:string)=>void) {
						setValue(this.editLeft ? working : their);
					},
					rhs: function(setValue:(v:string)=>void) {
						setValue(this.editLeft ? their : working);
					},
					// height: (h:number)=>{
					// 	return this.parent.clientHeight + "px";
					// },
					// width: (w:number)=>{
					// 	return this.parent.clientWidth + "px";
					// }
				});
				// let right = jQuery(this.mergelyDiv).mergely('cm', 'rhs');
				// console.log('right hand cm = ', right);		
			}
		);
	}

}