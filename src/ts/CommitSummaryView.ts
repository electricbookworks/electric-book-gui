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

		// Set human time string. Leave locale undefined,
		// so that the user gets their default locale's format.
		let humanDate = new Date(cs.When())
			.toLocaleDateString(undefined, {
				weekday: 'long',
				year: 'numeric',
				month: 'long',
				day: 'numeric',
				hour: 'numeric',
				minute: 'numeric'
			});

		this.$.when.textContent = humanDate;
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