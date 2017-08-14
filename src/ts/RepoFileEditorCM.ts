import {Eventify} from './Eventify';
import {RepoFileEditorCM as Template} from './Templates';
import {EditorCodeMirror} from './EditorCodeMirror';
import {EditorImage} from './EditorImage';
import {EBW} from './EBW';
import {FileContent, FileStat, FileStatString} from './FS/FS';
import {FSFileEdit} from './FS/FSFileEdit';

import signals = require('signals');

interface RepoFileEditorCallbacks {
	Rename: ()=>void;
}

enum EditorEvents {
	SAVED = 1,
	CHANGED = 2,
	LOADED = 3
}

class repoEditorActionBar {
	protected saveButton: HTMLButtonElement;
	protected undoButton: HTMLButtonElement;
	protected deleteButton: HTMLButtonElement;
	protected renameButton: HTMLButtonElement;

	constructor(protected editor:RepoFileEditorCM) {
		this.saveButton = document.getElementById(`editor-save-button`) as HTMLButtonElement;
		this.saveButton.addEventListener(`click`, (evt)=>{
			evt.preventDefault();
			this.editor.saveEditorFile();
		});
		this.undoButton = document.getElementById(`editor-undo-button`) as HTMLButtonElement;
		this.undoButton.addEventListener(`click`, (evt)=>{
			evt.preventDefault();
			this.editor.undoEditorFile();
		});
		this.deleteButton = document.getElementById(`editor-delete-button`) as HTMLButtonElement;
		this.deleteButton.addEventListener(`click`, (evt)=>{
			evt.preventDefault();
			this.editor.deleteEditorFile();
		});
		this.renameButton = document.getElementById(`editor-rename-button`) as HTMLButtonElement;
		this.editor.EditEvents.add(this.EditEvents, this);
	}
	EditEvents(ev:EditorEvents, file:FSFileEdit) : void {
		if (!file) {
			this.deleteButton.disabled = true;
			this.deleteButton.innerText = 'Delete';
			this.saveButton.disabled = true;
			this.undoButton.disabled = true;
			this.renameButton.disabled = true;
			return;
		}
		this.deleteButton.disabled = false;
		this.saveButton.disabled = false;
		this.undoButton.disabled = false;
		this.renameButton.disabled = false;
		console.log(`repoEditorActionBar: file = `, file.FileContent() ? FileStatString(file.FileContent().Stat) : "", file );
		this.deleteButton.innerText = (file.IsDeleted()) ? "Undelete": "Delete";
	}

}

/**
 * RepoFileEditorCM is a file editor that wraps what was meant to be
 * a generic editor, but in actual fact turns out to have some
 * dependencies upon CodeMirror, and hence isn't entirely generic.
 */
export class RepoFileEditorCM extends Template {
	protected textEditor : EditorCodeMirror;
	protected imageEditor: EditorImage;
	protected file: FSFileEdit;
	protected undoKey: string;
	public EditEvents: signals.Signal;

	constructor(
		repoOwner: string,
		repoName: string,
		protected parent:HTMLElement,
		protected callbacks: RepoFileEditorCallbacks
		) {
		super();
		this.undoKey = `RepoFileEditorCM:UndoHistory:${encodeURIComponent(repoOwner)}:${encodeURIComponent(repoName)}:`;
		this.EditEvents = new signals.Signal();
		new repoEditorActionBar(this);
		this.EditEvents.dispatch(EditorEvents.LOADED, undefined);

		this.textEditor = new EditorCodeMirror(this.$.textEditor);
		this.imageEditor = new EditorImage(this.$.imageEditor, repoOwner, repoName);
		this.parent.appendChild(this.el);
	}

	undoEditorFile() {
		EBW.Confirm(`Undo the changes you've just made to ${this.file.Name()}?`)
		.then(
			(b:boolean)=>{
				if (!b) return;
				this.file.Revert()
				.then(
					(fc:FileContent)=>{
						this.file.SetFileContent(fc);
						this.textEditor.setValue(fc.Content);
						this.EditEvents.dispatch(EditorEvents.CHANGED, this.file);
					});
			});		
	}

	/**
	 * deleteEditorFile handles file deleting and undeleting.
	 */
	deleteEditorFile() {
		if (!this.file) {
			EBW.Alert(`Please choose a file before using delete/undelete`);
			return;
		}
		if (this.file.IsDeleted()) {
			this.file.Save(this.textEditor.getValue(), FileStat.Changed)
			.then(
				(fc:FileContent)=>{
					if (fc.Stat!=FileStat.NotExist) {
						this.file.SetFileContent(fc);
						this.EditEvents.dispatch(EditorEvents.CHANGED, this.file);
					} else {
						this.file = undefined;
						this.setFile(undefined);
						this.EditEvents.dispatch(EditorEvents.LOADED, undefined);
					}
				});
			return;
		}
		EBW.Confirm(`Are you sure you want to delete ${this.file.Name()}?`)
		.then(
			()=>{
				return this.file.Remove()
				.then( (fc:FileContent)=> {
					if (fc.Stat == FileStat.NotExist) {
						this.file = undefined;
						this.setFile(undefined);	
						this.EditEvents.dispatch(EditorEvents.LOADED, undefined);										
					} else {
						this.file.SetFileContent(fc);
						this.EditEvents.dispatch(EditorEvents.CHANGED, this.file);
					}
				});
			})
		.catch( EBW.Error );
	}

	saveEditorFile() {
		this.file.Save(this.textEditor.getValue())
		.then(
			(fc:FileContent)=>{
				console.log(`About to Sync ${this.file.Name()}`);
				return this.file.Sync();				
			})
		.then(
			(fc:FileContent)=>{
				if (fc.Stat == FileStat.NotExist) {
					EBW.Toast(`${this.file.Name()} removed`);
					// By presetting file to undefined, we ensure that
					// setFile doesn't save the file again
					this.file = undefined;
					this.setFile(undefined);	
					this.EditEvents.dispatch(EditorEvents.LOADED, undefined);										
				} else {
					this.file.SetFileContent(fc);
					this.EditEvents.dispatch(EditorEvents.CHANGED, this.file);
					EBW.Toast(`${this.file.Name()} saved.`);
				}
			})
		.catch(
			(err:any)=>{
				console.error(err);
				EBW.Error(err)
			});		
	}
	setText(text:string){
		if ('string'!=typeof text) {
			debugger;
		}
		this.textEditor.setValue(text);
	}
	/**
	 * saveHistoryFor saves the history for the given path
	 */
	protected saveHistoryFor(path:string) {
		let key = this.undoKey + path;
		sessionStorage.setItem(key, this.textEditor.getHistory());
	}
	/**
	 * restoreHistoryFor restores the history for the given
	 * path
	 */
	protected restoreHistoryFor(path:string) {
		let key  =this.undoKey + path;
		this.textEditor.setHistory(sessionStorage.getItem(key));
	}

	setFile(file:FSFileEdit) {
		if (this.file) {
			if (this.file.Name()==file.Name()) {
				// Cannot set to the file we're currently editing
				return;
			}
			this.file.Save(this.textEditor.getValue());
			this.file.SetEditing(false);
			this.saveHistoryFor(this.file.Name());
		}
		if ('undefined'==typeof file) {
			this.file = undefined;
			this.setText('Please select a file to edit.');
			this.setBoundFilenames();
			this.EditEvents.dispatch(EditorEvents.LOADED, undefined);
			return;
		}
		let imgRegexp = new RegExp(`.*\.(jpg|png|tiff|svg|gif)$`);
		if (imgRegexp.test(file.Name())) {
			this.imageEditor.setFile(file);
			this.showImageEditor();
			this.file = undefined;
			this.EditEvents.dispatch(EditorEvents.LOADED, undefined);
			return;
		}
		this.showTextEditor();

		file.GetText()
		.then(
			(t:string)=>{
				this.file = file;
				this.file.SetEditing(true);
				this.setBoundFilenames();
				this.setText(t);
				this.restoreHistoryFor(this.file.Name());
				this.textEditor.focus();
				this.EditEvents.dispatch(EditorEvents.CHANGED, this.file);
			})
		.catch(
			(err:any)=>{
				EBW.Error(err);
			});
	}
	File() : FSFileEdit {
		return this.file;
	}
	Rename(name:string) : Promise<void> {
		return this.file.Rename(name)
		.then( ()=>{
			console.log(`Rename is concluded: this.file = `, this.file);
			let list = document.querySelectorAll(`[ebw-bind="current-filename"]`);
			for (let i=0; i<list.length; i++) {
				let e = list.item(i) as HTMLElement;
				e.textContent = name;
			}
			return Promise.resolve();
		});
	}
	protected setBoundFilenames() {
		let filename = 'CHOOSE A FILE';
		if (this.file) {
			filename = this.file.Name();
		}
		let list = document.querySelectorAll('[ebw-bind="current-filename"]');
		for (let i = 0; i<list.length; i++) {
			let e = list.item(i) as HTMLElement;
			e.textContent = filename;
		}
	}

	protected showImageEditor() {
		this.$.textEditor.style.display='none';
		this.$.imageEditor.style.display='block';
	}
	protected showTextEditor() {
		this.$.textEditor.style.display='block';
		this.$.imageEditor.style.display='none';
	}
}
