import {Context} from '../Context';
import {conflict_FileListDisplay as Template} from '../Templates';
import {FileListEvent, FileList} from './FileList';
import {File} from './File';
import {FileDisplayEvent, FileDisplay} from './FileDisplay';
import {MergingInfo} from './MergingInfo';
import signals = require('signals');

export enum FileListDisplayEvent {
	FileClick
}

export class FileListDisplay extends Template {
	public Listen: signals.Signal;

	constructor(protected context:Context, protected parent:HTMLElement, 
		fileList: FileList, protected mergingInfo:MergingInfo) 
	{
		super();
		this.Listen = new signals.Signal();

		fileList.Listen.add(this.fileListEvent, this);
		if (this.mergingInfo.IsPRMerge()) {
			this.el.classList.add(`pr-merge`);
		} else {
			this.el.classList.add(`not-pr-merge`);
		}
		this.parent.appendChild(this.el);
	}
	fileListEvent(e:FileListEvent, f:File) : void{
		switch (e) {
			case FileListEvent.FileNew:
				let fd = new FileDisplay(this.context, this.el, f, this.mergingInfo);
				fd.Listen.add( this.fileDisplayEvent, this );
				break;
		}
	}
	fileDisplayEvent(evt: FileDisplayEvent, f: File) : void {
		switch (evt) {
			case FileDisplayEvent.FileClick:
				this.Listen.dispatch(FileListDisplayEvent, f);
				break;
		}
	}
}