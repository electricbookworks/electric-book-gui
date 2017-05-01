import {API} from './API';
import {APIWs} from './APIWs';
import {Toast} from './Toast';
import {AddNewBookDialog} from './AddNewBookDialog';
import {RepoEditorPage} from './RepoEditorPage';
import {QuerySelectorAllIterate} from './querySelectorAll-extensions';
import './AllFilesList';

export class EBW {
	static instance : EBW;
	protected api : API;
	constructor() {
		if (null==EBW.instance) {
			EBW.instance = this;
			this.api = new APIWs();
			jQuery(document).foundation();
			AddNewBookDialog.instantiate();
			RepoEditorPage.instantiate();
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
	static Toast(msg : string, ...args:string[]) : void {
		Toast.Show(msg + args.join(' '));
	}
	static Prompt(msg: string) : Promise<string|boolean> {
		let r : string|boolean = prompt(msg);
		return Promise.resolve(``==r ? false : r);
	}
}

document.addEventListener('DOMContentLoaded', function() {
	new EBW();
});