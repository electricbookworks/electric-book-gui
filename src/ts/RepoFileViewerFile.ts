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
			src = `/www/${this.context.RepoOwner}/${this.context.RepoName}/repo/${this.filename}?v=` + (this.version++);
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
		this.$.filename.textContent = this.filename ? this.filename : `Drop a file to upload.`;
		parent.Insert(this.el);

		this.el.addEventListener('drop', (evt)=>{
			evt.preventDefault();	// Necessary so the browser doesn't just display the dropped item
			this.page.FileDrop(this, evt);
		});
		this.el.addEventListener('drag', (evt)=>{
		});
		this.el.addEventListener('dragover', (evt)=>{
			evt.preventDefault();
		});
		this.el.addEventListener(`dragend`,(evt:DragEvent)=>{
			evt.preventDefault();
			let dt = evt.dataTransfer;
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