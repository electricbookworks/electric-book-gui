import {Context} from './Context';
import {WordWrapButton} from './WordWrapButton';
import {DiffPrintButton} from './DiffPrintButton';

export class RepoDiffPatchPage {
	constructor(protected context:Context) {
		new WordWrapButton(document.getElementById('wrap-button'),
			document.getElementById('repo-diff-patch'));
		new DiffPrintButton(document.getElementById('diff-print-button'),
			document.getElementById('repo-diff-patch'));
	}
}
