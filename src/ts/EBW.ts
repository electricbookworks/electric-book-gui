import {API} from './API';
import {APIWs} from './APIWs';
import {Context} from './Context';
import {Toast} from './Toast';
import {AddNewBookDialog} from './AddNewBookDialog';
import {LoginTokenList} from './LoginTokenList';
import {RepoDetailPage} from './RepoDetailPage';
import {RepoEditorPage} from './RepoEditorPage';
import {RepoConflictPage} from './RepoConflictPage';
import {QuerySelectorAllIterate} from './querySelectorAll-extensions';
import {PullRequestMergePage} from './PullRequestMergePage';
import {RepoDiffViewerPage} from './RepoDiffViewerPage';
import {RepoFileViewerPage} from './RepoFileViewerPage';

export class EBW {
	static instance : EBW;
	protected api : API;
	constructor() {
		if (null==EBW.instance) {
			EBW.instance = this;
			this.api = new APIWs();
			jQuery(document).foundation();
			LoginTokenList.init();

			let el = document.getElementById(`ebw-context`);
			let context : Context;
			if (el) {
				context = new Context(el, el.getAttribute(`data-repo-owner`),
					el.getAttribute(`data-repo-name`));
				switch (el.getAttribute('data-page')) {
					case 'RepoDetailPage':
						new RepoDetailPage(context);
						break;
					case 'RepoConflictPage':
						new RepoConflictPage(context);
						break;
					case 'RepoDiffViewerPage':
						new RepoDiffViewerPage(context);
						break;
					case 'RepoFileViewerPage':
						new RepoFileViewerPage(context, document.getElementById(`repo-file-viewer`) as HTMLElement);
						break;
				}
			}
			/* TODO: This should actually use a Router
			   to determine what content we have. */
			AddNewBookDialog.instantiate();
			RepoEditorPage.instantiate();
			PullRequestMergePage.instantiate();
		}
		return EBW.instance;
	}
	static API() : API {
		let ebw = new EBW();
		return ebw.api;
	}
	static Error(err : any) : void {
		console.error('ERROR: ', err);
		debugger;
		alert(err);
	}
	static Alert(msg:string) : Promise<void> {
		alert(msg);
		return Promise.resolve();
	}
	static Toast(msg : string, ...args:string[]) : void {
		Toast.Show(msg + args.join(' '));
	}
	static Prompt(msg: string) : Promise<string> {
		let r : string = prompt(msg);
		return Promise.resolve<string>(r);
	}
	static Confirm(msg:string) : Promise<boolean> {
		return Promise.resolve<boolean>(confirm(msg));
	}
	// flatten takes returns a function that accepts an 
	// array of arguments, and calls the callback function
	// with each array element as a distinct parameter.
	static flatten(callback:any, context?:any) {
		return function(argsArray:any[]) {
			callback.apply(context, argsArray);
		}
	}		
}

document.addEventListener('DOMContentLoaded', function() {
	console.log(`DOMContentLoaded - EBW`);
	new EBW();
});