import {AddToParent} from '../DOM';
import {Context} from '../Context';
import {EBW} from '../EBW';
import {FileContent, FileEvent, File} from './File';
import {MergeEditorAction, MergeEditorControlBar} from './MergeEditorControlBar';
import jQuery = require('jquery');

import signals = require('signals');
import CodeMirror = require('codemirror');

// MergeEditor controls a Mergely class
export class MergeEditor {
	protected mergelyDiv: HTMLDivElement;
	public Listen : signals.Signal;
	protected file:File;
	protected editLeft = true;
	protected editBoth = true;
	protected controls : MergeEditorControlBar;

	constructor(
		protected context:Context,
		protected parent:HTMLElement
		) 
	{
		this.Listen = new signals.Signal();
		this.controls = new MergeEditorControlBar();
		this.controls.Listen.add(this.controlAction, this);
	}
	// WorkingSide returns a string describing the side on which the
	// final version will be displayed.
	WorkingSide() : string {
		return this.editLeft ? "left" : "right";
	}
	// TheirSide returns a string describing the side on which
	// the submitted changes will be displayed.
	TheirSide() : string {
		return this.editLeft ? "right" : "left";
	}

	controlAction(act:MergeEditorAction) {
		switch(act) {
			case MergeEditorAction.Save:
				this.SaveFile()
				.catch( EBW.Error );
				break;
			case MergeEditorAction.Delete:
				break;
			case MergeEditorAction.Resolve:
				this.SaveFile()
				.then(
					()=>{
						// undefined so we receive notifications
						return this.file.Commit(undefined);
					})
				.then(
					()=>{
						EBW.Toast(`Resolved changes on ${this.file.Path()}`);
					})
				.catch(EBW.Error);
				break;
			case MergeEditorAction.RevertOur:
				this.RevertOur();
				break;
			case MergeEditorAction.RevertTheir:
				this.RevertTheir();
				break;
			case MergeEditorAction.CopyWorking:
				this.CopyWorking();
				break;
			case MergeEditorAction.CopyTheir:
				this.CopyTheir();
				break;
			case MergeEditorAction.RevertGit:
		}
	}
	setWorkingText(t:string) {
		if (this.editLeft) {
			this.setLHS(t);
		} else {
			this.setRHS(t);
		}
	}
	setTheirText(t:string) {
		if (this.editLeft) {
			this.setRHS(t);
		} else {
			this.setLHS(t);
		}
	}
	getWorkingText() : string {
		if (this.editLeft) {
			return this.getLHS();
		}
		return this.getRHS();
	}
	getTheirText() : string {
		if (this.editLeft) {
			return this.getRHS();
		}
		return this.getLHS();
	}
	getWorkingContent() : FileContent {
		return new FileContent(this.isWorkingDeleted(), this.getWorkingText());
	}
	getTheirContent() : FileContent {		
		return new FileContent(this.isTheirDeleted(), this.getTheirText());
	}
	CopyTheir() : void {
		// We leave source undefined, so that our editor will update
		// when the change arrives		
		console.log(`isTheirDeleted = ${this.isTheirDeleted()}, text = ${this.getTheirText()}`);
		this.file.SetWorkingContent(undefined, this.isTheirDeleted() ? undefined : this.getTheirText());
	}
	CopyWorking() : void {
		// We leave source undefined, so that our editor will update
		// when the change arrives
		console.log(`isWorkingDeleted = ${this.isWorkingDeleted()}`);
		console.log(`working text = ${this.getTheirText()}`);
		this.file.SetTheirContent(undefined, this.isWorkingDeleted() ? undefined : this.getWorkingText());
	}
	RevertOur() : void {
		// Leave source undefined so that our editor updates when
		// changes arrive.
		this.file.RevertOur(undefined)
		.catch(EBW.Error);
	}
	RevertTheir() : void {
		// Leave source undefined so that our editor updates when
		// changes arrive.	
		this.file.RevertTheir(undefined)
		.catch(EBW.Error);
	}
	isWorkingDeleted() : boolean {
		return !this.file.WorkingFile().Exists;
	}
	isTheirDeleted() : boolean {
		return !this.file.TheirFile().Exists;
	}
	setText(s:string) {
		if (this.editLeft) {
			this.setLHS(s);
		} else {
			this.setRHS(s);
		}
	}
	getLeftCM() {
		return jQuery(this.mergelyDiv).mergely('cm', 'lhs');
	}
	getRightCM() {
		return jQuery(this.mergelyDiv).mergely('cm', 'rhs');
	}
	getLHS() : string {
		return this.getLeftCM().getDoc().getValue();
	}
	getRHS() : string {
		return this.getRightCM().getDoc().getValue();
	}
	setLHS(s:string) {
		if (!s) s=``;
		this.getLeftCM().getDoc().setValue(s);
	}
	setRHS(s:string) {
		if (!s) s=``;
		this.getRightCM().getDoc().setValue(s);
	}
	SaveFile() : Promise<string> {
		if (this.file) {
			let f = this.file;
			let w = this.getWorkingText();
			// We pass ourselves as the source, so that we don't update
			// our editor when the change event arrives
			this.file.SetWorkingContent(this, this.isWorkingDeleted() ? undefined : this.getWorkingText());
			this.file.SetTheirContent(this, this.isTheirDeleted() ? undefined : this.getTheirText());
			return this.file.Save()
			.then(
				()=>{
					EBW.Toast(`Saved ${f.Path()}`);
					return Promise.resolve(``);
				});
		}
		return Promise.reject(`No file to save`);
	}
	FileEventListener(source:any, e:FileEvent, fc:FileContent) {
		// If we were ourselves the source of the event, we ignore it.
		if (source==this) {
			return;
		}
		switch (e) {
			case FileEvent.WorkingChanged:
				this.setWorkingText(fc.Raw);
				break;
			case FileEvent.TheirChanged:
				this.setTheirText(fc.Raw);
				break;
			case FileEvent.StatusChanged:
				break;
		}
	}
	// Merge starts merging a file.
	Merge(file:File) : void {
		console.log(`Merge: ${file.Path()}`);
		if (this.file && this.file.Path()==file.Path()) {
			return;	// Nothing to do if we're selecting the same file
		}
		// Save any file we're currently editing
		if (this.file) {
			this.SaveFile();
			this.file.Listen.remove(this.FileEventListener, this);
		}
		// Controls must receive update before we do.
		// TODO : Actually, the controls should listen to US, not to the
		// file, and we should have an 'EditorStateModel'...
		this.controls.SetFile(file);
		// VERY importantly, we don't listen to the file 
		// until after we've concluded the FetchContent, because
		// we won't have an editor to populate when FetchContent
		// sends its signals that the content has changed.
		// However, because we configure ourselves as the source,
		// if we were listening, it shouldn't be a problem...
		let p = file.FetchContent(this)
		.then(
			()=>{
				return Promise.all( [file.WorkingFile(), file.TheirFile()] );
			}
		)
		.then(
			(args:FileContent[]) => {
				let [working,their] = [ args[0], args[1] ];	
				this.file = file;

				this.file.Listen.add(this.FileEventListener, this);

				let lhsText:string, rhsText:string;
				if (this.editLeft) {
					lhsText = working.Raw;
					rhsText = their.Raw;
				} else {
					lhsText = their.Raw;
					rhsText = working.Raw;
				}

				// Create a new Mergely Editor for each file
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
					editor_height: "100%",
					lhs: function(setValue:(v:string)=>void) {
						setValue(lhsText);
					},
					rhs: function(setValue:(v:string)=>void) {
						setValue(rhsText);
					},
				});	
			}
		);
	}

}