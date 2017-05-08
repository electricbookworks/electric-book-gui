import {Eventify} from './Eventify';
import {RepoFileModel} from './RepoFileModel';
import {RepoFileEditLink as Template} from './Templates';

export class RepoFileEditLink extends Template {
	constructor(
		protected parent:HTMLElement, 
		protected file:RepoFileModel, 
		protected click:any) 
	{
		super();
		this.$.name.textContent = this.file.Path();
		this.click = click;
		this.file.EditingSignal.add( (f:RepoFileModel,editing:boolean)=> {
			this.SetEditing(editing);
		});
		this.SetEditing(false);
		this.file.DirtySignal.add( (f:RepoFileModel,dirty:boolean)=>{
			if (dirty) {
				this.el.classList.add('file-dirty');
			} else {
				this.el.classList.remove('file-dirty');
			}
		});
		Eventify(this.el, {
			'click': (evt:any)=>{
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