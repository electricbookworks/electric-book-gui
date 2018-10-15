import {ConflictEditor} from './ConflictEditor';
import {Context} from '../Context';
import {EBW} from '../EBW';
import {File,FileEvent,FileContent} from './File';
import {ImageIdentify} from '../ImageIdentify';
import {MergeEditorControlBar,MergeEditorAction} from './MergeEditorControlBar';

import signals = require('signals');
import CodeMirror = require('codemirror');
import {EditorCodeMirror} from '../EditorCodeMirror';
import {MergeImageEditor} from './MergeImageEditor';

export class SingleEditor implements ConflictEditor {
	public Listen:signals.Signal;
	protected file:File;
	protected editor:EditorCodeMirror;
	protected isDeleted:boolean;
	protected controls:MergeEditorControlBar;
	protected imageEditor: MergeImageEditor;

	constructor(protected context:Context,
		protected parent:HTMLElement) {
		this.Listen = new signals.Signal();

		this.controls = new MergeEditorControlBar();
		this.controls.Listen.add(this.controlAction, this);
		this.imageEditor = undefined;
		this.editor = undefined;
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
						return this.file.Stage(undefined);
					})
				.then(
					()=>{
						EBW.Toast(`Resolved changes on ${this.file.Path()}`);
					})
				.catch(EBW.Error);
				break;
			case MergeEditorAction.RevertOur:
				this.file.RevertOur(undefined);
				break;
			case MergeEditorAction.RevertTheir:
				this.file.RevertOurToTheir(undefined);
				break;
			case MergeEditorAction.RevertGit:
				this.file.RevertOurToGit(undefined);
				break;
		}
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
	setWorkingText(s:string) : void{
		this.editor.setValue(s);
	}
	isWorkingDeleted() : boolean {
		return this.isDeleted;
	}
	SaveFile() : Promise<string> {
		if (this.imageEditor) {
			return Promise.resolve(``);
		}
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
	FileEventListener(source:any, e:FileEvent, fc:FileContent) : void {
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
			if (!this.imageEditor) {
				this.SaveFile();
			}
			this.file.Listen.remove(this.FileEventListener, this);
			this.file = undefined;
		}
		// Controls must receive update before we do.
		// TODO : Actually, the controls should listen to US, not to the
		// file, and we should have an 'EditorStateModel'...
		if (ImageIdentify.isImage(file.Path())) {
			this.parent.textContent = ``;
			this.imageEditor = new MergeImageEditor(
				this.context, this.parent, file.Path()
				);
			this.file = file;
			this.file.Listen.add(this.FileEventListener, this);
			console.log(`created new MergeImageEditor with parent `, this.parent);
			this.controls.setImageEditing(true);
			return;
		}
		this.controls.setImageEditing(false);
		this.imageEditor= null;
		this.parent.innerHTML = ``;
		this.editor = new EditorCodeMirror(this.parent);

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
				console.log(`About to set file contents to `, working.Raw);
				if (working.Exists) {
					this.editor.setValue(working.Raw);
				} else {
					this.editor.setValue(``);
				}
				this.editor.setModeOnFilename(file.Path());
			}
		);
	}
}