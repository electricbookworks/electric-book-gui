import {EBW} from './EBW';
import {Context} from './Context';
import {Eventify} from './Eventify';
import {RepoMergeDialog as Template} from './Templates';
import {DialogEvents, FoundationRevealDialog as Dialog} from './FoundationRevealDialog';

import signals = require('signals');

/**
 * RepoMergeDialog displays options about how a
 * repo merge should occur.
 *
 */
export class RepoMergeDialog extends Template {
	protected $el : any;
	protected dialog: Dialog;
	protected repoRemote:string;
	public MergeEvent:signals.Signal;
	constructor(
		protected context: Context,
		openElement:HTMLElement
	) {
		super();
		Eventify(this.el, {
			"click": (evt:Event)=>{
				evt.preventDefault(); evt.stopPropagation();
				this.MergeEvent.dispatch(this);
			}
		});

		this.MergeEvent = new signals.Signal();

		this.dialog = new Dialog(openElement, this.el);
		this.dialog.Events.add( (act:DialogEvents)=>{
			switch (act) {
				case DialogEvents.Opened:
					this.$.resolveOur.checked = true;
					this.$.resolveGit.checked = false;
					this.$.resolveTheir.checked = false;
					this.$.conflicted.checked = false;
					break;
				case DialogEvents.Closed:
					// Don't really need to do anything here, because we'll reset 
					// on open
					break;
			}
		});
	}
	GetResolve() : string {
		if (this.$.resolveOur.checked) return "our";
		if (this.$.resolveGit.checked) return "git";
		if (this.$.resolveTheir.checked) return "their";
		return "-";
	}
	GetConflicted() : boolean {
		return this.$.conflicted.checked;
	}
	GetContext() : Context {
		return this.context;
	}
	Open() {
		this.dialog.Open();
	}
	SetTitle(titleHTML:string) : void {
		this.$.title.innerHTML = titleHTML;
	}
	SetRepoRemote(repoRemote:string) : void {
		this.repoRemote = repoRemote;
	}
	GetRepoRemote() : string {
		return this.repoRemote;
	}
}