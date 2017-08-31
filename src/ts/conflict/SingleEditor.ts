import {Context} from '../Context';
import {EBW} from '../EBW';
import {File,FileEvent,FileContent} from './File';

import signals = require('signals');
import CodeMirror = require('codemirror');

export class SingleEditor {
	public Listen:signals.Signal;
	protected file:File;
	protected editor:CodeMirror.Editor;
	protected isDeleted:boolean;

	constructor(protected context:Context,
		protected parent:HTMLElement) {
		this.Listen = new signals.Signal();
		this.editor = CodeMirror(parent);
	}
	WorkingSide():string {
		return "-";
	}
	TheirSide():string {
		return '-';
	}
	getWorkingText() : string {
		return this.editor.getValue();
	}
	setWorkingText(s:string) {
		this.editor.setValue(s);
	}
	isWorkingDeleted() : boolean {
		return this.isDeleted;
	}

	SaveFile() : Promise<string> {
		if (this.file) {
			let f = this.file;
			let w = this.getWorkingText();
			// We pass ourselves as the source, so that we don't update
			// our editor when the change event arrives
			this.file.SetWorkingContent(this, this.isWorkingDeleted() ? undefined : 
				this.getWorkingText());

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
			this.file = undefined;
		}
		// Controls must receive update before we do.
		// TODO : Actually, the controls should listen to US, not to the
		// file, and we should have an 'EditorStateModel'...
		
		//this.controls.SetFile(file);

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

				let text = working.Raw;

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