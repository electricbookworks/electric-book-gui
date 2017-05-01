import {PullRequestDiffList_File as Template} from './Templates';
import {PRDiffModel} from './PRDiffModel';

interface Callback {
	(d:PRDiffModel):void;
}

export class PullRequestDiffList_File extends Template {
	constructor(
		protected parent:HTMLElement, 
		protected diff: PRDiffModel,
		protected callback: Callback) {
		super();
		this.el.textContent = diff.path();
		this.el.addEventListener('click', (evt)=>{
			this.callback(this.diff);
		});
		parent.appendChild(this.el);
	}
}