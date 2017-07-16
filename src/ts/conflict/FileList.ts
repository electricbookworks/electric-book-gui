import {Context} from '../Context';
import {File} from './File';
import signals = require('signals');

export enum FileListEvent {
	FileNew,
	FileChanged
};

export class FileList {
	protected files: Array<File>;
	public Listen: signals.Signal;

	constructor(protected context:Context) {
		this.files = new Array<File>();
		this.Listen = new signals.Signal();
	}

	load(js:any) : void {
		// I expect js to be an array of {Path:string, Status:string}
		for (let j of js) {
			let f = new File(this.context, j.Path as string, j.Status as string);
			this.files.push(f);
			this.Listen.dispatch(FileListEvent.FileNew, f);
		}
	}
}