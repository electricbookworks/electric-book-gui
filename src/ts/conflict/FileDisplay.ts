import {Context} from '../Context';
import {File} from './File';
import {conflict_FileDisplay as Template} from '../Templates';
import signals = require('signals');

export enum FileDisplayEvent {
	FileClick
}

export class FileDisplay extends Template {
	public Listen: signals.Signal;

	constructor(protected context:Context, parent:HTMLElement, protected file:File) {
		super();
		this.Listen = new signals.Signal();

		this.$.path.innerText = file.Path();
		this.$.status.innerText = file.Status();

		this.el.addEventListener(`click`, (evt)=>{
			evt.preventDefault(); evt.stopPropagation();
			console.log(`CLICKED: ${this.file.Path()}`);
			this.dispatchEvent(`file-click`);
			this.Listen.dispatch(FileDisplayEvent.FileClick, this.file);
		});
		parent.appendChild(this.el);
	}
	dispatchEvent(name:string) {
		let d = { bubbles: true, detail: { file: this.file } };
		this.el.dispatchEvent(new CustomEvent(name, d));
	}
}