import {Context} from './Context';
import {CommitSummary} from './CommitSummary';
import {CommitSummaryList} from './CommitSummaryList';
import {CommitSummaryListView} from './CommitSummaryListView';

class RepoDiffDatesForm {
	constructor(protected context:Context) {
		this.fromDate = document.getElementById(`from-date`);
		this.toDate = document.getElementById(`to-date`);
		this.button = document.getElementById(`diff-dates-button`);

		let checkClick = (evt)=>{
			// console.log(`fromDate = '${this.fromDate.value}', toDate = '${this.toDate.value}'`)
			if ((``==this.fromDate.value) || (``==this.toDate.value)) {
				this.button.disabled = true;
				return;
			}
			this.button.disabled = false;
		};
		this.fromDate.addEventListener(`input`, checkClick);
		this.toDate.addEventListener(`input`, checkClick);
		checkClick(null);

		/*
		
		// moved on to form submission, so no button handling required
		// bar enabling /  disabling.
		//

		if (!this.button) {
			console.error(`Failed to find diff-dates-button`);
			return;
		}

		this.button.addEventListener(`click`, (evt)=>{
			evt.preventDefault();
			evt.stopPropagation();

			let from = this.fromDate.value;
			let to = this.toDate.value;
			this.context.RepoRedirect(`diff-dates/${from}/${to}`, null);
		});
		*/

	}
}

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

		new RepoDiffDatesForm(context);
	}
	enableViewButton() {
		let disable = (this.fromOID==undefined) || (this.toOID==undefined);
		this.viewButton.disabled = disable;
		// console.log(`viewButton.disabled = ${this.viewButton.disabled}`);
	}
}