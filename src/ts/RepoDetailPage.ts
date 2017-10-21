import {Context} from './Context';
import {EBW} from './EBW';
import {RepoMergeDirectButton} from './RepoMergeDirectButton';
import {RepoMergeDialog} from './RepoMergeDialog';

export class RepoDetailPage {
	constructor(protected context:Context) {
		RepoMergeDirectButton.init(this.context);

		let el = document.getElementById(`cancelAllChanges`);
		if (el) {
			el.addEventListener(`click`, (evt)=>{
				evt.preventDefault(); evt.stopPropagation();
				EBW.Confirm(`All your changes will be lost. This is non-recoverable. Continue?`)
				.then( (b:boolean)=>{
					if (b) {
						document.location.href = `/repo/${context.RepoOwner}/${context.RepoName}/conflict/abort`;
						return;
					}
				});
			});
		};
		// let dialog = new RepoMergeDialog(context, undefined);
		// RepoMergeButton.init(this.context, dialog);
		// dialog.MergeEvent.add(this.mergeEvent, this);
	}
	// mergeEvent(dialog:RepoMergeDialog) : void {
	// 	let resolve = dialog.GetResolve();
	// 	let conflicted = dialog.GetConflicted();
	// 	let context = dialog.GetContext();
	// 	document.location.href = `/repo/${context.RepoOwner}/${context.RepoName}/merge/${dialog.GetRepoRemote()}` +
	// 		`?resolve=${resolve}&conflicted=${conflicted}`;
	// }
}
