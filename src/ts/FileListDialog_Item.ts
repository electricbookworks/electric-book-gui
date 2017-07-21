import {FileListDialog_Item as Template} from './Templates';
import {FileListDialog} from './FileListDialog';

export class FileListDialogItem extends Template {
	constructor(protected path:string, protected dialog:FileListDialog) {
		super();
		this.$.title.textContent = path;
		this.$.input.addEventListener('click', (evt)=>{
			evt.preventDefault();
			evt.stopPropagation();
			this.dialog.Close(this.path);
		})
	}
	isSet() {
		return (this.$.input.checked);
	}
}