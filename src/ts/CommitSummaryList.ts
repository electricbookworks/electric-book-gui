import {CommitSummary} from './CommitSummary';

interface Listener {
	addCommit(CommitSummary);
}

export class CommitSummaryList {
	protected listeners : Array<Listener>;
	constructor() {
		this.listeners = new Array<Listener>();
	}
	addListener(l:Listener) {
		this.listeners.push(l);
	}
	removeListener(l:Listener) {
		this.listeners.remove(l);
	}
	add(cs:CommitSummary) {
		this.listeners.forEach( (l)=>l.addCommit(cs) );
	}
}