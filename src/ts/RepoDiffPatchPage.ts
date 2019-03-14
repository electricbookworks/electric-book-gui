import {Context} from './Context';
import {PrintButton} from './PrintButton';
import {WordWrapButton} from './WordWrapButton';

export class RepoDiffPatchPage {
	constructor(protected context:Context) {
		new WordWrapButton(document.getElementById('wrap-button'),
			document.getElementById('repo-diff-patch'));
		new PrintButton(document.getElementById('print-button'));
	}
}