class EditorCodeMirror {
	constructor(parent) {
		this.cm = CodeMirror(parent, {
			'mode': 'markdown',
			'lineNumbers':true,
			'lineWrapping': true
		});
	}
	static Template() {
		return 'RepoFileEditor_codemirror';
	}
	getValue() {
		return this.cm.getDoc().getValue();
	}
	setValue(s) {
		this.cm.getDoc().setValue(s);
	}
}