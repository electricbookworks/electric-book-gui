import CodeMirror = require('codemirror');// from 'codemirror';

export class EditorCodeMirror {
	protected cm : any;
	constructor(parent:HTMLElement) {
		this.cm = CodeMirror(parent, {
			'mode': 'markdown',
			'lineNumbers':true,
			'lineWrapping': true
		});
	}
	static Template() : string {
		return 'RepoFileEditor_codemirror';
	}
	getValue() : string {
		return this.cm.getDoc().getValue();
	}
	setValue(s:string) : void {
		this.cm.getDoc().setValue(s);
		this.cm.refresh();
	}
}