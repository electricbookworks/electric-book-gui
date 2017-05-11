import {Eventify} from './Eventify';
import {RepoFileEditor_codemirror} from './Templates';
import {EditorCodeMirror} from './EditorCodeMirror';
import {EBW} from './EBW';
import {FileContent} from './FS/FS';
import {FSFileEdit} from './FS/FSFileEdit';

interface RepoFileEditorCallbacks {
	Rename: ()=>void;
}

export class RepoFileEditorCM extends RepoFileEditor_codemirror {
	protected editor : EditorCodeMirror;
	protected file: FSFileEdit;

	constructor(
		protected parent:HTMLElement,
		protected callbacks: RepoFileEditorCallbacks
		) {
		super();

		Eventify(document.getElementById('editor-actions'), {
			'save': (evt:any)=>{
				evt.preventDefault();
				this.file.Save(this.editor.getValue())
				.then(
					(fc:FileContent)=>{
						console.log(`About to Sync ${this.file.Name()}`);
						return this.file.Sync();					
					})
				.then(
					(fc:FileContent)=>{
						// this.$.save.disabled = true;
						EBW.Toast(`${this.file.Name()} saved.`);
					})
				.catch(
					(err:any)=>{
						console.error(err);
						EBW.Error(err)
					});
			},
			'undo': (evt:any)=> {
				evt.preventDefault();
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
			},
			'delete': (evt:any)=> {
				evt.preventDefault();
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
		});

		this.editor = new EditorCodeMirror(this.$.editor);
		this.parent.appendChild(this.el);
		// this.editor.getSession().on('change', (evt)=>{
		// 	console.log(`editor-on-change: justLoaded = ${this.justLoaded}`);
		// 	this.$.save.disabled = this.justLoaded;
		// 	this.justLoaded = false;
		// });
		sessionStorage.clear();
	}
	setText(text:string){
		if ('string'!=typeof text) {
			debugger;
		}
		this.editor.setValue(text);
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
