import {API} from './API';
import {APIWs} from './APIWs';
import {Toast} from './Toast';
import {AddNewBookDialog} from './AddNewBookDialog';
import {RepoEditorPage} from './RepoEditorPage';
import {QuerySelectorAllIterate} from './querySelectorAll-extensions';
import './AllFilesList';
import {PullRequestMergePage} from './PullRequestMergePage';

export class EBW {
	static instance : EBW;
	protected api : API;
	constructor() {
		if (null==EBW.instance) {
			EBW.instance = this;
			this.api = new APIWs();
			console.log(`Activating foundation on the document`);
			jQuery(document).foundation();
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
	new EBW();
});