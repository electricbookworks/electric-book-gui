import {conflict_ClosePRDialog as Template} from '../Templates';
import {DialogEvents as FoundationRevealDialogEvents, FoundationRevealDialog} from '../FoundationRevealDialog';
import {Eventify} from '../Eventify';

export class ClosePRDialogResult {
	Close? : boolean;
	CloseMessage?: string;
	Cancelled: boolean;
}

export class ClosePRDialog extends Template {
	protected resolve: (m:ClosePRDialogResult)=>void;
	protected dialog: FoundationRevealDialog;
	protected clearOnOpen: boolean;
	// firstOpen is set false after the first time the dialog is opened.
	// This allows us to initialize default values iff this is the first usage,
	// or to go with the user's settings if this is not the first usage.
	protected firstOpen = true;

	constructor(clearOnOpen: boolean) {
		super();
		
		this.clearOnOpen = clearOnOpen;

		this.dialog = new FoundationRevealDialog(undefined, this.el);
		this.dialog.Events.add( this.dialogEvent, this );

		Eventify(this.el, {
			"change": (evt:Event) => {
				evt.stopPropagation(); evt.preventDefault();
				console.log(`Clicked `, evt.target);
				let close = (evt.target as HTMLElement).getAttribute("value")=="yes";
				if (close) {
					this.$.closeMessage.removeAttribute('disabled');
				} else {
					this.$.closeMessage.setAttribute('disabled','disabled');
				}
			},
			"done": (evt:Event)=>{
				console.log(`done event`);
				evt.stopPropagation(); evt.preventDefault();
				this.resolve({
					Close:this.$.closePR_yes.checked,
					CloseMessage:this.$.closeMessage.value, 
					Cancelled: false});
				this.resolve = undefined;
				this.dialog.Close();
			}	
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
				}
				return;
		};
	}

	// Open returns a Promise that will return a string[]. The string[]
	// will either contain two elements: 
	Open(title:string, instructions:string, defaultSetting?:ClosePRDialogResult) : Promise<ClosePRDialogResult> {
		this.$.title.innerText = title;
		this.$.instructions.innerText = instructions;

		if (defaultSetting && this.firstOpen) {
			this.firstOpen = true;
			this.$.closePR_yes.checked = defaultSetting.Close;
			this.$.closePR_no.checked = !(this.$.closePR_yes.checked);
			if (this.$.closePR_yes.checked) {
				this.$.closeMessage.removeAttribute(`disabled`);
			} else {
				this.$.closeMessage.setAttribute(`disabled`,`disabled`);
			}
		}
		if (this.clearOnOpen) {
			this.$.closePR_yes.checked = false;
			this.$.closePR_no.checked = true;
			this.$.closeMessage.setAttribute('disabled','disabled');
		}

		return new Promise<ClosePRDialogResult>(
			(resolve,reject)=>{
				this.resolve = resolve;
				this.dialog.Open();
			});
	}
}