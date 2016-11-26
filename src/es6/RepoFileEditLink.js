class RepoFileEditLink {
	constructor(parent, file, click) {
		this.parent = parent;
		this.file = file;
		[this.el, this.$] = DTemplate(`RepoFileEditLink`);
		this.$.name.textContent = this.file.path.substring('book/text/'.length);
		this.click = click;
		this.file.EditingSignal.add( (f,editing)=> {
			this.SetEditing(editing);
		});
		this.SetEditing(false);
		this.file.DirtySignal.add( (f,dirty)=>{
			if (dirty) {
				this.el.classList.add('file-dirty');
			} else {
				this.el.classList.remove('file-dirty');
			}
		});
		Eventify(this.el, {
			'click': (evt)=>{
				evt.preventDefault();
				this.click(this, this.file);
			}
		}, this);

		if (parent) {
			parent.appendChild(this.el);
		}
	}
	SetEditing(editing) {
		this.$.editing.style.visibility = editing ? 'visible' : 'hidden';
	}
}