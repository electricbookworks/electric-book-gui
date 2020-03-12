import {Context} from './Context';
import {EBW} from './EBW';
import {DOMInsert} from './DOMInsert';
import {RepoFileViewerFile as Template} from './Templates';
import {RepoFileViewerPage} from './RepoFileViewerPage';

export class RepoFileViewerFile extends Template {
	// version allows us to force browser-reload
	protected version: number;
	Refresh() : void {
		let src = `/img/plus.svg`;
		if (``!=this.filename) {
			src = `/www/${this.context.RepoOwner}/${this.context.RepoName}/${this.filename}?v=` + (this.version++);
		}
		this.$.img.setAttribute('src', src);
	}
	Filename() : string {
		return this.filename;
	}
	// IsAddButton returns true if this RepoFileViewerFile is in fact just the generic
	// 'add a new file' button
	IsAddButton() : boolean {
		return ``==this.filename;
	}

	constructor(protected context:Context, protected filename:string, parent:DOMInsert, protected page: RepoFileViewerPage) {
		super();
		this.version = 1;
		this.Refresh();
		this.$.filename.innerHTML = this.filename ? this.filename : `Drop a file here to upload it.<br>Drop a file on any image to replace it.`;
		
		parent.Insert(this.el);
		
		if (this.IsAddButton()) {
			this.el.setAttribute('title', 'Drop a file here to upload it')
			this.el.classList.add('repo-file-drop');
		}

		this.el.addEventListener('drop', (evt)=>{
			evt.preventDefault();	
			// Necessary so the browser doesn't just display the dropped item
			console.log(`Going to run this.page.FileDrop`);
			this.page.FileDrop(this, evt);
		});
		this.el.addEventListener('drag', (evt)=>{
		});
		this.el.addEventListener('dragover', (evt)=>{
			evt.preventDefault();
			this.el.classList.add('file-dragover');
		});
		this.el.addEventListener('dragleave', (evt) => {
			evt.preventDefault();
			this.el.classList.remove('file-dragover');
		});
		this.el.addEventListener(`dragend`,(evt:DragEvent)=>{
			evt.preventDefault();
			let dt = evt.dataTransfer;
			console.log(`dragend: dt = `, dt);
			if (dt.items) {
				for (let i=0; i<dt.items.length; i++) {
					dt.items.remove(i);
				}
			} else {
				dt.clearData();
			}
		});
	}
}