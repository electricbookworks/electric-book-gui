import {Context} from './Context';

export class RepoMergeDirectButton {
	constructor(protected context:Context, protected el:HTMLElement) {
		let href = `/repo/${context.RepoOwner}/` +
				`${context.RepoName}/merge/` + 
				el.getAttribute('data-repo-merge') +
				`?resolve=our&conflicted=yes`;
		console.log(`onclick for `, el , `  = `, href);
		el.addEventListener(`click`, (evt)=>{
			evt.preventDefault(); evt.stopPropagation();
			document.location.href = `/repo/${context.RepoOwner}/` +
				`${context.RepoName}/merge/` + 
				el.getAttribute('data-repo-merge') +
				`?resolve=our&conflicted=false`;
		});
		el.classList.add(`btn`);
	}

	static init(context:Context) {
		let els = document.querySelectorAll(`[data-instance="RepoMergeButton"]`);
		for(let i=0; i<els.length; i++) {
			new RepoMergeDirectButton(context, els.item(i) as HTMLElement);
		}
	}
}