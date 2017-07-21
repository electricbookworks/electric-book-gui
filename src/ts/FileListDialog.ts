import {DialogEvents as FoundationRevealDialogEvents, FoundationRevealDialog} from './FoundationRevealDialog';
import {FileListDialog as Template} from './Templates';
import {FileListDialogItem} from './FileListDialog_Item';
import {Eventify} from './Eventify';

export class FileListDialogResult {
	FileList?: string;
	Cancelled: boolean;
}

export class FileListDialog extends Template {
	protected resolve: (m:FileListDialogResult)=>void;
	protected dialog: FoundationRevealDialog;
	protected items: Array<FileListDialogItem>;

	constructor() {
		super();
		this.dialog = new FoundationRevealDialog(undefined, this.el);
		this.dialog.Events.add( this.dialogEvent, this );
	}

	Close(filePath:string) {
		this.resolve({
			FileList: filePath,
			Cancelled: false});
		this.resolve = undefined;
		this.dialog.Close();
	}

	dialogEvent(evt:FoundationRevealDialogEvents) {
		switch (evt) { 
			case FoundationRevealDialogEvents.Closed:
				// If the commit button was pressed, we have resolved
				// the promise, and have cleared this.resolve
				if (this.resolve) {
					this.resolve({Cancelled:true});
				}
				return;
			case FoundationRevealDialogEvents.Opened:
				return;
		};
	}

	// Open returns a Promise that will return a string[]. The string[]
	// will either contain two elements: 
	Open(fileList:string[]) : Promise<FileListDialogResult> {
		this.$.list.innerText = ``;
		this.items = [];
		for (let f of fileList) {
			let i = new FileListDialogItem(f, this);
			this.$.list.appendChild(i.el);
			this.items.push(i);
		}

		return new Promise<FileListDialogResult>(
			(resolve,reject)=>{
				this.resolve = resolve;
				this.dialog.Open();
			});
	}
}