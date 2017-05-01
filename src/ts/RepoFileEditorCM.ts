import {Eventify} from './Eventify';
import {RepoFileEditor_codemirror} from './Templates';
import {EditorCodeMirror} from './EditorCodeMirror';
import {EBW} from './EBW';

export class RepoFileEditorCM extends RepoFileEditor_codemirror {
	protected editor : EditorCodeMirror;
	protected file: any;

	constructor(protected parent:HTMLElement) {
		super();
		this.file = false;

		Eventify(document.getElementById('editor-actions'), {
			'save': (evt)=>{
				evt.preventDefault();
				this.file.SetText(this.editor.getValue());
				this.file.Save()
				.then(
					()=>{						
						// this.$.save.disabled = true;
						EBW.Toast(`Document saved.`);
					})
				.catch(
					(err)=>{
						console.error(err);
						EBW.Error(err)
					});
			},
			'undo': (evt)=> {
				evt.preventDefault();
				if (confirm(`Undo the changes you've just made to ${this.file.Path()}?`)) {
					let orig = this.file.Original();
					this.file.SetText(orig);
					this.setText(orig);
					this.file.SetText(this.file.Original());
				}
			},
			'delete': (evt)=> {
				evt.preventDefault();
				if (confirm(`Are you sure you want to delete ${this.file.Path()}?`)) {
					this.file.Delete()
					.then( (res)=> {
						this.file = null;
						this.setFile(null);
					})
					.catch( (err)=>{
						EBW.Error(err);
					});
				}
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
	setText(text){
		this.editor.setValue(new String(text));
	}
	setFile(file) {
		if (this.file) {
			if (this.file==file) {
				return;	// Cannot set to the file we're currently editing
			}
			this.file.SetText(this.editor.getValue());
			this.file.SetEditing(false);
		}
		if (!file) {
			// @TODO Need to catch New Files here... ?
			this.setText('Please select a file to edit.');
			return;
		}
		file.GetText()
		.then(
			(t)=>{
				this.file = file;
				this.file.SetEditing(true);
				for (let e of document.querySelectorAll('[ebw-current-filename]')) {
					e.textContent = file.path;
				}
				this.setText(t);
			})
		.catch(
			(err)=>{
				EBW.Error(err);
			});
	}
}
