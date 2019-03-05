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
	getHistory() : string {
		return JSON.stringify(this.cm.getHistory());
	}
	setHistory(hist?:string) : void {
		if (hist) {
			this.cm.setHistory(JSON.parse(hist));
		} else {
			this.cm.clearHistory();
		}
	}

	/**
	 * focus sets the input focus to the editor
	 */
	focus() : void {
		this.cm.focus();
	}

	/**
	 * setModeOnFilename sets the editor mode / highlighting
	 * based on the filename of the file you're editing.
	 */
	setModeOnFilename(filename:string) {
		let r = /\.([^\.]+)$/;
		let res = r.exec(filename);
		if (res!=null && 2==res.length) {
			let suffix = res[1];
			let modes = new Map<string,string>();
			modes.set('md','markdown');
			modes.set('js','javascript');
			modes.set('css','css');
			modes.set('scss','sass');
			modes.set('sass','sass');
			modes.set('yaml','yaml');
			modes.set('yml','yaml');
			modes.set('xml','xml');

			let mode = modes.get(res[1]);
			if (mode) {
				this.cm.setOption(`mode`, mode);
			}
		}
	}
}