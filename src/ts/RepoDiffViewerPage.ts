import {Context} from './Context';
import {CommitSummary} from './CommitSummary';
import {CommitSummaryList} from './CommitSummaryList';
import {CommitSummaryListView} from './CommitSummaryListView';

export class RepoDiffViewerPage {
	protected fromOID : string;
	protected toOID: string;
	protected viewButton : HTMLButtonElement;

	constructor(protected context:Context) {
		let commits = JSON.parse(document.getElementById('commit-summaries').innerText);

		let summaries = new CommitSummaryList();
		let fromList = new CommitSummaryListView(document.getElementById(`commit-from`), summaries);
		let toList = new CommitSummaryListView(document.getElementById(`commit-to`), summaries);
		commits.forEach( (c) => {
			summaries.add(new CommitSummary(c.When, c.OID, c.Message));
		});

		fromList.el.addEventListener(`commit-click`, (evt)=>{
			this.fromOID = evt.detail.OID();
			this.enableViewButton();
		});
		toList.el.addEventListener(`commit-click`, (evt)=>{
			this.toOID = evt.detail.OID();
			this.enableViewButton();
		});

		this.viewButton = document.getElementById(`diff-view`);
		this.enableViewButton();
		this.viewButton.addEventListener(`click`, (evt)=>{
			evt.preventDefault(); evt.stopPropagation();
			context.RepoRedirect(`diff/${this.fromOID}/${this.toOID}`);
		});
	}
	enableViewButton() {
		let disable = (this.fromOID==undefined) || (this.toOID==undefined);
		this.viewButton.disabled = disable;
		console.log(`viewButton.disabled = ${this.viewButton.disabled}`);
	}
}