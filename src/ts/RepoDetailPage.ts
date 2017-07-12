import {Context} from './Context';
import {RepoMergeDirectButton} from './RepoMergeDirectButton';
import {RepoMergeDialog} from './RepoMergeDialog';

export class RepoDetailPage {
	constructor(protected context:Context) {
		RepoMergeDirectButton.init(this.context);
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
