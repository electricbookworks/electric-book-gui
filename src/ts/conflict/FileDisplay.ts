import {Context} from '../Context';
import {File, FileEvent} from './File';
import {conflict_FileDisplay as Template} from '../Templates';
import {MergingInfo} from './MergingInfo';
import signals = require('signals');

export enum FileDisplayEvent {
	FileClick
}

export class FileDisplay extends Template {
	public Listen: signals.Signal;

	constructor(protected context:Context, parent:HTMLElement, protected file:File, protected mergingInfo:MergingInfo) {
		super();
		this.Listen = new signals.Signal();

		this.$.path.innerText = file.Path();
		this.fileEvent(undefined, FileEvent.StatusChanged, undefined);

		this.el.addEventListener(`click`, (evt)=>{
			evt.preventDefault(); evt.stopPropagation();
			this.dispatchEvent(`file-click`);
			this.Listen.dispatch(FileDisplayEvent.FileClick, this.file);
		});

		this.file.Listen.add(this.fileEvent, this);
		this.file.ListenRPC.add(this.rpcEvent, this);
		parent.appendChild(this.el);
	}
	dispatchEvent(name:string) {
		let d = { bubbles: true, detail: { file: this.file } };
		this.el.dispatchEvent(new CustomEvent(name, d));
	}
	fileEvent(source:any, event: FileEvent, data:any) {
		switch (event) {
			case FileEvent.StatusChanged:
				this.$.status.innerText = this.file.Status();
				this.el.classList.remove(`status-new`,`status-modified`,`status-resolved`,`status-deleted`,`status-conflict`,`status-error`);
				this.el.classList.add(`status-${this.file.Status()}`);				
				break;
		}
	}
	rpcEvent(source:any, inProgress:boolean, method:string) {
		console.log(`RPC Event for ${this.file.Path()} inProgress = ${inProgress}, method = ${method}`);
		let cl = this.el.classList;
		if (inProgress) {
			cl.add(`rpc`);
		} else {
			cl.remove(`rpc`);
		}
	}
}