import {FS, FileContent, FileStat} from './FS/FS';
import {FSFileList_File as Template} from './Templates';
import {AddToParent} from './DOM';
import {Eventify} from './Eventify';
import {FSNotify} from './FS/FSNotify';

import signals = require('signals');

/**
 * FSFileList_File implements a single file element in the 
 * list of files in the FileSystem.
 *
 * It doesn't listen directly to the FS, but rather gets the
 * FSFileList to trigger it's FSEvent method.
 */
export class FSFileList_File extends Template {
	constructor(
		parent:HTMLElement,
		protected file: FileContent,
		protected FS: FSNotify,
		events: any,
		protected ignoreFunction: (name:string)=>boolean
	) {
		super();
		if (this.ignoreFunction(this.file.Name)) {
			this.el.classList.add('ignore');
		}
		this.$.name.textContent = this.file.Name;
		Eventify(this.el, events);
		// This method will be triggered by FSFileList.
		// this.FS.Listeners.add(this.FSEvent, this);
		AddToParent(parent, this.el as HTMLElement);
	}
	FSEvent(path:string, fc:FileContent): void {
		// console.log(`In FSFileList_File.FSEvent(${path}) - stat = ${fc.Stat}`)
		if (path != this.file.Name) {
			// If path's don't match, this doesn't affect us.
			return;
		}
		switch (fc.Stat) {
			case FileStat.Changed:
				this.FS.IsDirty(this.file.Name)
				.then(
					(dirty)=>{
						if (dirty) {
							this.el.classList.add('changed');
						} else {
							this.el.classList.remove('changed');
						}
					});
				this.el.classList.remove(`removed`);
				break;
			case FileStat.Deleted:
				this.el.classList.remove('changed');
				this.el.classList.add('removed');
				break;
			case FileStat.Exists:
				this.el.classList.remove('changed','removed');
				break;
			case FileStat.NotExist:
				this.el.remove();
				this.FS.Listeners.remove(this.FSEvent, this);
				break;
		}
	}
}
