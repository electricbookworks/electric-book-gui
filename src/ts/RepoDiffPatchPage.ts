import {Context} from './Context';
import {WordWrapButton} from './WordWrapButton';

export class RepoDiffPatchPage {
	constructor(protected context:Context) {
		new WordWrapButton(document.getElementById('wrap-button'),
			document.getElementById('repo-diff-patch'));
	}
}