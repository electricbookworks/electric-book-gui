import {Context} from './Context';
import {RepoMergeDialog} from './RepoMergeDialog';
import signals = require('signals');

export class RepoMergeButton {
	constructor(protected context:Context, protected el:HTMLElement, protected dialog:RepoMergeDialog) {
		el.addEventListener(`click`, (evt)=>{
			evt.preventDefault(); evt.stopPropagation();
			this.dialog.SetTitle(el.innerHTML);
			this.dialog.SetRepoRemote(el.getAttribute(`data-repo-merge`));
			this.dialog.Open();
		});
		el.classList.add(`btn`);
	}

	static init(context:Context, dialog:RepoMergeDialog) {
		let els = document.querySelectorAll(`[data-instance="RepoMergeButton"]`);
		for(let i=0; i<els.length; i++) {
			new RepoMergeButton(context, els.item(i) as HTMLElement, dialog);
		}
	}
}