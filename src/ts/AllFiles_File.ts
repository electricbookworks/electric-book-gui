import {FileInfo,FileState} from './FS/FileInfo';
import {AllFiles_File as Template} from './Templates';
import {AddToParent} from './DOM';
import {Eventify} from './Eventify';

export class AllFiles_File extends Template {
	constructor(
		parent:HTMLElement|undefined, 
		protected fileInfo:FileInfo,
		events: any
	) {
		super();
		this.$.name.textContent = fileInfo.Name();
		Eventify(this.el, events);
		AddToParent(parent, this.el);
	}
}