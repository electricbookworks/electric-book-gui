import {BoundFilename} from './BoundFilename';
import {Eventify} from './Eventify';
import {RepoFileEditorCM as Template} from './Templates';
import {EditorCodeMirror} from './EditorCodeMirror';
import {EditorImage} from './EditorImage';
import {EBW} from './EBW';
import {File} from './FS2/File';
import {FileState} from './FS2/FileState';
import {FS} from './FS2/FS';
import {ImageIdentify} from './ImageIdentify';

import signals = require('signals');

interface RepoFileEditorCallbacks {
	Rename: ()=>void;
}

export enum EditorEvents {
	Saved = 1,
	Changed = 2,
	Loaded = 3,
	Unloaded = 4
}

/**
 * EditorEvent is the event sent by the RepoFileEditor when a file is being edited, saved, or
 * a new file is being loaded.
 */
export class EditorEvent {
	constructor(protected event:EditorEvents,protected file:File|undefined = undefined) {}
	static Saved(f:File) : EditorEvent {
		return new EditorEvent(EditorEvents.Saved, f);
	}
	static Changed(f:File):EditorEvent {
		return new EditorEvent(EditorEvents.Changed, f);
	}
	static Loaded(f:File|undefined=undefined):EditorEvent {
		return new EditorEvent(EditorEvents.Loaded, f);
	}
	static Unloaded(f:File):EditorEvent {
		return new EditorEvent(EditorEvents.Unloaded, f);
	}
	File() : File|undefined { return this.file; }
	Event():EditorEvent { return this.event; }
}

/**
 * repoEditorActionBar provides the buttons that are used to interact with the editor for
 * saving, undoing and deleting.
 */
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
		this.editor.Listeners.add(this.EditorEvents, this);
	}
	EditorEvents(ev:EditorEvent) : void {
		// console.log(`repoEditoActionBar.EditorEvents: ev = `, ev);
		let file=ev.File();
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
		//console.log(`repoEditorActionBar: file = `, file.FileContent() ? FileStatString(file.FileContent().Stat) : "", file );
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
	
	protected loadingFile : File;
	protected file: File;
	protected undoKey: string;
	/** Listeners will receive EditorEvent's */
	public Listeners: signals.Signal;

	constructor(
		repoOwner: string,
		repoName: string,
		protected parent:HTMLElement,
		protected callbacks: RepoFileEditorCallbacks,
		protected FS:FS
		) {
		super();
		this.undoKey = `RepoFileEditorCM:UndoHistory:${encodeURIComponent(repoOwner)}:${encodeURIComponent(repoName)}:`;
		this.Listeners = new signals.Signal();
		new repoEditorActionBar(this);
		this.Listeners.dispatch(EditorEvent.Loaded());

		this.textEditor = new EditorCodeMirror(this.$.textEditor);
		this.imageEditor = new EditorImage(this.$.imageEditor, repoOwner, repoName);
		this.parent.appendChild(this.el);
		BoundFilename.BindAll(repoOwner, repoName);
	}

	undoEditorFile() {
		EBW.Confirm(`Undo the changes you've just made to ${this.file.Name()}?`)
		.then(
			(b:boolean)=>{
				if (!b) return;
				this.FS.Revert(this.file.Name())
				.then(
					(f:File)=>{
						console.log(`RepoFileEditorCM.undoEditorFile: Revert returned file=`, f);
						this.file = f;
						f.DataEvenIfDeleted()
						.then(
							(raw:string|undefined)=>{
								if ('undefined'==typeof raw) {
									raw = '';
								}
								this.textEditor.setValue(raw);
								this.Listeners.dispatch(EditorEvent.Changed(this.file));
							}
						);
					}).catch( EWB.Error );
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
		// Need to check that this is a text file... no, I won't get deleteEditorFile _unless_
		// this is a text file.
		this.file.data = this.textEditor.getValue();
		this.FS.FileState(this.file.Name())
		.then(
			(fs:FileState)=>{
				if (fs==FileState.Deleted) {

					// Actually want to undo this deletion
					// this.file.SetFileContent(fc.Content);
					this.file.DataEvenIfDeleted()
					.then(
						(raw:string|undefined)=>{
							 this.FS.Write(this.file.Name(), raw)
						})
					.then(
						(f:File)=>{ this.file = f; return Promise.resolve(); })
					.catch(EBW.Error);

					this.Listeners.dispatch(EditorEvent.Changed(this.file));
				} else {
					EBW.Confirm(`Are you sure you want to delete ${this.file.Name()}?`)
					.then(
						()=>{
							return this.FS.Remove(this.file.Name())
							.then(
								(f:File)=>{
									this.Listeners.dispatch(EditorEvent.Unloaded(this.file));
									this.file = undefined;
									this.setFile(undefined);
									this.Listeners.dispatch(EditorEvent.Loaded(undefined));
								});
						})
					.catch( EBW.Error );
				}
			});
	}

	saveEditorFile() {
		/* @TODO Need to ensure that no file-load occurs during file-save */
		let f = this.file;
		this.FS.Write(f.Name(), this.textEditor.getValue())
		.then( (f:File)=>this.FS.Sync(f.Name()) )
		.then(
			(f:File)=>{
				if (!f.exists) {
					EBW.Toast(`${f.Name()} removed`);

					// By presetting file to undefined, we ensure that
					// setFile doesn't save the file again
					this.file = undefined;
					this.setFile(undefined);
					this.Listeners.dispatch(EditorEvent.Loaded(undefined));
				} else {
					this.file = f;
					this.Listeners.dispatch(EditorEvent.Changed(this.file));
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
		let key = this.undoKey + path;
		this.textEditor.setHistory(sessionStorage.getItem(key));
	}

	setFile(file:File) {
		if (this.file) {
			if (this.file.Name()==file.Name()) {
				console.log(`We're already editing ${file.Name()} - nothing to do`);
				// Cannot set to the file we're currently editing
				return;
			}
			this.file.data = this.textEditor.getValue();
			this.FS.Set(this.file);
			this.saveHistoryFor(this.file.Name());
			this.Listeners.dispatch(EditorEvent.Unloaded(this.file));
			this.file = undefined;
		}
		if ('undefined'==typeof file) {
			this.file = undefined;
			this.setText('Please select a file to edit.');
			this.setBoundFilenames();
			this.Listeners.dispatch(EditorEvent.Loaded(undefined));
			return;
		}
		if (ImageIdentify.isImage(file.Name())) {
			this.imageEditor.setFile(file);
			this.showImageEditor();
			this.file = undefined;
			this.Listeners.dispatch(EditorEvent.Loaded(undefined));
			return;
		}
		this.showTextEditor();
		this.loadingFile = file;
		
		file.DataEvenIfDeleted()
		.then(
			(t:string)=>{
				// If we start loading file A, then start loading file
				// B, and file B returns before file A, when file A
				// returns, we are configuring ourselves as file A when
				// in fact we should be file B.
				// This if statement catches an 'out-of-sequence' 
				// loaded A, and just ignores it, since we are now loading
				// B.
				if (this.loadingFile.Name()!=file.Name()) {
					return;
				}
				this.file = file;
				this.setBoundFilenames();
				this.setText(t);
				this.restoreHistoryFor(this.file.Name());
				this.textEditor.setModeOnFilename(file.Name());
				this.textEditor.focus();
				// HAD BEEN .Changed
				this.Listeners.dispatch(EditorEvent.Loaded(this.file));
			})
		.catch(EBW.Error);
	}
	
	File() : File  { return this.file; }

	Rename(name:string) : Promise<void> {
		return this.FS.Move(this.file.Name(), name)
		.then( (f:File)=>{
			this.Listeners.dispatch(EditorEvent.Unloaded(this.file));
			this.file = f;
			BoundFilename.SetFilename(name);
			this.Listeners.dispatch(EditorEvent.Loaded(this.file));
			return Promise.resolve();
		});
	}
	protected setBoundFilenames() {
		let filename = 'CHOOSE A FILE';
		if (this.file) {
			filename = this.file.Name();
		}
		BoundFilename.SetFilename(filename);
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
