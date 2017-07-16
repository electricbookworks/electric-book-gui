import {EditorImage as Template} from './Templates';
import {FSFileEdit} from './FS/FSFileEdit';
import {AddToParent} from './DOM';

import signals = require('signals');

export class EditorImage extends Template {
	protected file: FSFileEdit;
	constructor(
		protected parent: HTMLElement, 
		protected repoOwner: string,
		protected repoName: string
		) {
		super();
		AddToParent(parent, this.el);
	}
	setFile(f:FSFileEdit) {
		this.file = f;
		let L = document.location;
		let imageUrl = `url('/www/` + 
			`${this.repoOwner}/${this.repoName}/${f.Name()}')`;
		this.el.style.backgroundImage = imageUrl;
	}
}