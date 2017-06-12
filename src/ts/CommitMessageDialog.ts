import {CommitMessageDialog as Template} from './Templates';
import {DialogEvents as FoundationRevealDialogEvents, FoundationRevealDialog} from './FoundationRevealDialog';

export class CommitMessageDialogResult {
	Notes? : string;
	Message?: string;
	Cancelled: boolean;
}
export class CommitMessageDialog extends Template {
	protected resolve: (m:CommitMessageDialogResult)=>void;
	protected dialog: FoundationRevealDialog;
	protected clearOnOpen: boolean;

	constructor(clearOnOpen: boolean) {
		super();
		
		this.clearOnOpen = clearOnOpen;

		this.dialog = new FoundationRevealDialog(undefined, this.el);
		this.dialog.Events.add( this.dialogEvent, this );

		this.$.commit.addEventListener(`click`, (evt:Event)=>{
			evt.stopPropagation(); evt.preventDefault();
			this.resolve({
				Message:this.$.message.value, 
				Notes:this.$.notes.value,
				Cancelled: false});
			this.resolve = undefined;
			this.dialog.Close();
		});
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
				if (this.clearOnOpen) {
					this.$.notes.value = ``;
					this.$.message.value = ``;
				}
				return;
		};
	}

	// Open returns a Promise that will return a string[]. The string[]
	// will either contain two elements: 
	Open(title:string, instructions:string) : Promise<CommitMessageDialogResult> {
		this.$.title.innerText = title;
		this.$.instructions.innerText = instructions;

		return new Promise<CommitMessageDialogResult>(
			(resolve,reject)=>{
				this.resolve = resolve;
				this.dialog.Open();
			});
	}
}