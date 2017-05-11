import {Eventify} from './Eventify';
import {RepoFileEditor_codemirror} from './Templates';
import {EditorCodeMirror} from './EditorCodeMirror';
import {EBW} from './EBW';
import {FileContent} from './FS/FS';
import {FSFileEdit} from './FS/FSFileEdit';

import signals = require('signals');

interface RepoFileEditorCallbacks {
	Rename: ()=>void;
}

enum editorEvents {
	SAVED = 1,
	CHANGED = 2,
	LOADED = 3
}

interface repoFileEditor$ {
	SaveButton: HTMLButtonElement
	UndoButton: HTMLButtonElement
	DeleteButton: HTMLButtonElement
};

class repoEditorActionBar {
	protected saveButton: HTMLButtonElement;
	protected undoButton: HTMLButtonElement;
	protected deleteButton: HTMLButtonElement;

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
	}

}

export class RepoFileEditorCM extends RepoFileEditor_codemirror {
	protected editor : EditorCodeMirror;
	protected file: FSFileEdit;
	protected buttons: repoFileEditor$;
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

		this.editor = new EditorCodeMirror(this.$.editor);
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
						this.editor.setValue(fc.Content);
					});
			});		
	}

	deleteEditorFile() {
		EBW.Confirm(`Are you sure you want to delete ${this.file.Name()}?`)
		.then(
			()=>{
				return this.file.Remove()
				.then( (fc:FileContent)=> {
					this.file = undefined;
					this.setFile(undefined);
				});
			})
		.catch( EBW.Error );
	}

	saveEditorFile() {
		this.file.Save(this.editor.getValue())
		.then(
			(fc:FileContent)=>{
				console.log(`About to Sync ${this.file.Name()}`);
				return this.file.Sync();					
			})
		.then(
			(fc:FileContent)=>{
				// this.$.save.disabled = true;
				this.EditEvents.dispatch(`saved`, fc);
				EBW.Toast(`${this.file.Name()} saved.`);
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
		this.editor.setValue(text);
	}
	/**
	 * saveHistoryFor saves the history for the given path
	 */
	protected saveHistoryFor(path:string) {
		let key = this.undoKey + path;
		sessionStorage.setItem(key, this.editor.getHistory());
	}
	/**
	 * restoreHistoryFor restores the history for the given
	 * path
	 */
	protected restoreHistoryFor(path:string) {
		let key  =this.undoKey + path;
		this.editor.setHistory(sessionStorage.getItem(key));
	}

	setFile(file:FSFileEdit) {
		/**
		 * @TODO NEED TO SAVE THE UNDO HISTORY AND POSSIBLY
		 * RESTORE THE UNDO HISTORY FOR THE EDITOR
		 */
		if (this.file) {
			if (this.file.Name()==file.Name()) {
				// Cannot set to the file we're currently editing
				return;
			}
			this.file.SetText(this.editor.getValue());
			this.file.SetEditing(false);
			this.saveHistoryFor(this.file.Name());
		}
		if ('undefined'==typeof file) {
			this.file = undefined;
			this.setText('Please select a file to edit.');
			this.setBoundFilenames();
			return;
		}
		file.GetText()
		.then(
			(t:string)=>{
				this.file = file;
				this.file.SetEditing(true);
				this.setBoundFilenames();
				this.setText(t);
				this.restoreHistoryFor(this.file.Name());
				this.editor.focus();
			})
		.catch(
			(err:any)=>{
				EBW.Error(err);
			});
	}
	File() : FSFileEdit {
		return this.file;
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
}
