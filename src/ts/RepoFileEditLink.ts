import {Eventify} from './Eventify';
import {RepoFileModel} from './RepoFileModel';
import {Templates} from './Templates';

export class RepoFileEditLink {
	protected el:Templates.EL.RepoFileEditLink;
	protected $:Templates.R.RepoFileEditLink;

	constructor(protected parent:HTMLElement, protected file:RepoFileModel, click) {
		[this.el, this.$] = Templates.T.RepoFileEditLink();
		this.$.name.textContent = this.file.path();
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
		});
		if (parent) {
			parent.appendChild(this.el);
		}
	}
	SetEditing(editing:boolean):void {
		this.$.editing.style.visibility = editing ? 'visible' : 'hidden';
	}
}