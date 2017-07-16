import {MergeEditor} from './MergeEditor';
import {PRArgs} from './PRArgs';
import {PRDiffModel} from './PRDiffModel';
import {PullRequestDiffList_File} from './PullRequestDiffList_File';

export class PullRequestMergePage {
	protected files: PRDiffModel[];
	protected filesEL: HTMLElement;

	constructor(
		 diffs: any[],
		 protected prArgs:any, 
		 protected filesParent: HTMLElement,
		 protected mergelyParent:HTMLElement)
	{
		this.files = [];
		if (!this.filesParent) {
			alert(`PullRequestMergePage called, but filesParent is undefined`);
			debugger;
		}
		for (let d of diffs) {
			let diff = new PRDiffModel(d, prArgs);
			this.files.push(diff);
			new PullRequestDiffList_File(
				this.filesParent,
				diff,
				(d)=>{
					this.viewDiff(d);
				}
			);
		}
	}

	viewDiff(diff:PRDiffModel):void {
		this.mergelyParent.textContent='';
		new MergeEditor(this.mergelyParent, diff);
	}
	static instantiate():void {
		let pr = document.getElementById('pr-merge-page');
		if (pr) {
			new PullRequestMergePage(
				JSON.parse(pr.textContent),
				{
					repoOwner: pr.getAttribute(`repo-owner`),
					repoName: pr.getAttribute(`repo-name`),
					remoteURL: pr.getAttribute(`remote-url`),
					remoteSHA: pr.getAttribute(`remote-sha`)
				}, 
				document.getElementById(`pr-files-list`),
				document.getElementById(`mergely-container`)
			);
		}
	}

}