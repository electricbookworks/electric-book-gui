import {FileInfo} from './FS/FileInfo';
import {FileState} from './FS/FileState';
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
		fileInfo.Listener.add(this.FileEvent, this);
		AddToParent(parent, this.el as HTMLElement);
	}
	FileEvent(fileInfo:FileInfo): void {
		console.log(`FileEvent in _File: ${fileInfo.Name()}, state = `, fileInfo.State());
		switch (fileInfo.State()) {
			case FileState.Exists:
				this.el.classList.remove('changed','removed');
				break;
			case FileState.Changed:
				this.el.classList.add('changed');
				break;
			case FileState.Deleted:
				this.el.classList.remove('changed');
				this.el.classList.add('removed');
				break;
			case FileState.NotExist:
				this.el.remove();
				break;
		}
	}
}