/** @deprecated
 * We are using RepoFileEditorCM instead
 */
let mySettings = {
	onShiftEnter:  	{keepDefault:false, replaceWith:'<br />\n'},
	onCtrlEnter:  	{keepDefault:false, openWith:'\n<p>', closeWith:'</p>'},
	onTab:    		{keepDefault:false, replaceWith:'    '},
	markupSet:  [ 	
		{name:'Bold', key:'B', openWith:'(!(<strong>|!|<b>)!)', closeWith:'(!(</strong>|!|</b>)!)' },
		{name:'Italic', key:'I', openWith:'(!(<em>|!|<i>)!)', closeWith:'(!(</em>|!|</i>)!)'  },
		{name:'Stroke through', key:'S', openWith:'<del>', closeWith:'</del>' },
		{separator:'---------------' },
		{name:'Bulleted List', openWith:'    <li>', closeWith:'</li>', multiline:true, openBlockWith:'<ul>\n', closeBlockWith:'\n</ul>'},
		{name:'Numeric List', openWith:'    <li>', closeWith:'</li>', multiline:true, openBlockWith:'<ol>\n', closeBlockWith:'\n</ol>'},
		{separator:'---------------' },
		{name:'Picture', key:'P', replaceWith:'<img src="[![Source:!:http://]!]" alt="[![Alternative text]!]" />' },
		{name:'Link', key:'L', openWith:'<a href="[![Link:!:http://]!]"(!( title="[![Title]!]")!)>', closeWith:'</a>', placeHolder:'Your text to link...' },
		{separator:'---------------' },
		{name:'Clean', className:'clean', replaceWith:function(markitup) { return markitup.selection.replace(/<(.*?)>/g, "") } },		
		{name:'Preview', className:'preview',  call:'preview'}
	]
};

/**
 * @deprecated
 * Use RepoFileEditorCM instead
 */
class RepoFileEditor {
	constructor(parent, repo=false) {
		alert('@deprecated: use RepoFileEditorCM instead');
		debugger;
		this.parent = parent;
		this.repo = repo;
		if (!repo) {
			this.repo = parent.getAttribute('ebw-repo');
		}
		[this.el, this.$] = DTemplate('RepoFileEditor_ace');
		this.file = false;

		Eventify(this.el, {
			'save': function(evt) {
				evt.preventDefault();
				let content = this.editor.getValue();
				this.file.SetText(this.editor.getValue());
				this.file.Save()
				.then(
					()=>{						
						// this.$.save.disabled = true;
					})
				.catch(
					(err)=>{
						EBW.Error(err)
					});
			},
			'undo': function(evt) {
				evt.preventDefault();
				if (confirm(`Undo the changes you've just made to ${this.file.path}?`)) {
					let orig = this.file.Original();
					this.file.SetText(orig);
					this.setText(orig);
					this.file.SetText(this.file.Original());
				}
			},
			'delete': function(evt) {
				evt.preventDefault();
				if (confirm(`Are you sure you want to delete ${this.file.path}?`)) {
					this.file.Delete()
					.then( (res)=> {
						this.file = null;
						this.setFile(null);
					})
					.catch( (err)=>{
						EBW.Error(err);
					});
				}
			}
		}, this);

		this.editor = ace.edit(this.$.editor);
		this.editor.setTheme("ace/theme/twilight");
		this.editor.getSession().setMode("ace/mode/markdown");
		this.parent.appendChild(this.el);
		// this.editor.getSession().on('change', (evt)=>{
		// 	console.log(`editor-on-chance: justLoaded = ${this.justLoaded}`);
		// 	this.$.save.disabled = this.justLoaded;
		// 	this.justLoaded = false;
		// });
		sessionStorage.clear();
	}
	setText(text){
		this.editor.setValue(new String(text));
	}
	setFile(file) {
		if (this.file) {
			if (this.file==file) {
				return;	// Cannot set to the file we're currently editing
			}
			this.file.SetText(this.editor.getValue());
			this.file.SetEditing(false);
		}
		if (!file) {
			// @TODO Need to catch New Files here... ?
			this.setText('-- YOU NEED TO CHOOSE A FILE YOU WANT TO EDIT --');
			return;
		}
		file.GetText()
		.then(
			(t)=>{
				this.file = file;
				this.file.SetEditing(true);
				for (let e of document.querySelectorAll('[ebw-current-filename]')) {
					e.textContent = file.path;
				}
				this.setText(t);
			})
		.catch(
			(err)=>{
				EBW.Error(err);
			});
	}
}

// document.addEventListener('DOMContentLoaded', function() {
// 	for (let e of document.querySelectorAll('[data-instance="RepoFileEditor"]')) {
// 		new RepoFileEditor(e);
// 	}
// });