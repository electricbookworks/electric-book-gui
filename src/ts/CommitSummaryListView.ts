import {CommitSummaryListView as Template} from './Templates';
import {CommitSummary} from './CommitSummary';
import {CommitSummaryList, Listener} from './CommitSummaryList';
import {CommitSummaryView} from './CommitSummaryView';

export class CommitSummaryListView extends Template implements Listener {
	protected selected : CommitSummaryView;

	constructor(parent: HTMLElement, list: CommitSummaryList) {
		super();
		parent.appendChild(this.el);
		list.addListener(this);
		this.selected = undefined;
		// console.log(`CommitSummaryListView, this.$ = `, this.$);
		this.el.addEventListener(`commit-click`, (evt)=>{
			if (this.selected) {
				this.selected.Select(false);
			}
			this.selected = evt.detail;
			this.selected.Select(true);
		});
	}
	addCommit(c : CommitSummary) {
		let csv = new CommitSummaryView(this.$.summaries);
		csv.set(c);
	}
}