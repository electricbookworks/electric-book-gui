import {CommitSummaryView as Template} from './Templates';

export class CommitSummaryView extends Template {
	protected commit:CommitSummary;
	constructor(parent: HTMLElement) {
		super();
		parent.appendChild(this.el);
		this.el.addEventListener('click', (evt)=>{
			evt.preventDefault();
			evt.stopPropagation();
			this.el.dispatchEvent(
				new CustomEvent('commit-click',
					{
						'detail':this,
						'bubbles': true,
						'cancelable': true
					})
			);
		})
	}
	set(cs:CommitSummary) {
		this.commit = cs;
		this.$.when.textContent = cs.When();
		this.$.message.textContent = cs.Message();
	}
	OID() {
		return this.commit.OID();
	}
	Select(state:boolean) {
		this.el.classList.toggle('selected', state);
		console.log(`toggled selected state on `, this.el);
	}
}