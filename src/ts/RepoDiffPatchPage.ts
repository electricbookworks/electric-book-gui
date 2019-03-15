import {Context} from './Context';
import {PrintButton} from './PrintButton';
import {WordWrapButton} from './WordWrapButton';

export class RepoDiffPatchPage {
    constructor(protected context:Context) {
        document.body.classList.add(`repo-diff-patch-page`);
        console.log(`added repo-diff-patch-page to body classes`);
		new WordWrapButton(document.getElementById('wrap-button'),
			document.getElementById('repo-diff-patch'));
		new PrintButton(document.getElementById('print-button'));
	}
}
