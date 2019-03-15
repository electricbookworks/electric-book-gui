import {EditorImage as Template} from './Templates';
import {FSFileEdit} from './FS/FSFileEdit';
import {AddToParent} from './DOM';
import {File} from './FS2/File';

import signals = require('signals');

export class EditorImage extends Template {
	protected file: FSFileEdit|File;
	constructor(
		protected parent: HTMLElement, 
		protected repoOwner: string,
		protected repoName: string
		) {
		super();
		AddToParent(parent, this.el);
	}
	setFile(f:FSFileEdit|File) {
		this.file = f;
		let L = document.location;
		let imageUrl = `url('/www/` + 
			`${this.repoOwner}/${this.repoName}/${f.Name()}')`;
		this.el.style.backgroundImage = imageUrl;
	}
}