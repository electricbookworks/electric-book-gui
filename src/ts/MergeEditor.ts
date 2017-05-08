import {EBW} from './EBW';
import {Eventify} from './Eventify';
import {MergeEditor as Template} from './Templates';
import {PRDiffModel} from './PRDiffModel';
import {AddToParent} from './DOM';
import jQuery = require('jquery');

export class MergeEditor extends Template {
	protected mergelyDiv: HTMLDivElement;

	constructor(
		protected parent:HTMLElement, 
		protected model:PRDiffModel) 
	{
		super();
		Eventify(this.el, {
			'save': (evt:any)=>{
				evt.preventDefault();
				model.Update(this.get())
				.catch( err=>{
					console.log(`Error on the save function`);
					EBW.Error(err);
				});
			}
		});

		AddToParent(this.parent, this.el);		

		model.GetContent()
		.then( (args)=>this.mergely(args) )
		.catch( EBW.Error );
	}
	get() : string {
		let cm = jQuery(this.mergelyDiv).mergely('cm', 'lhs');
		return cm.getDoc().getValue();
	}
	mergely([local, remote, diff]:[string,string,string]) : void {
		this.$.mergely.textContent= ``;
		this.mergelyDiv = document.createElement(`div`) as HTMLDivElement;
		this.$.mergely.appendChild(this.mergelyDiv);
		let m = jQuery(this.mergelyDiv);
		m.mergely({
			cmsettings: { 
				readOnly: false, 
				lineNumbers: true,
				wrap_lines: true,
			},
			rhs_cmsettings: {
				// readOnly: true,
			},
			// editor_height: "40em",
			autoresize: true,
			editor_height: "100%",
			// editor_width: "48%",
			wrap_lines: true,
			lhs: function(setValue:(v:string)=>void) {
				setValue(local);
			},
			rhs: function(setValue:(v:string)=>void) {
				setValue(remote);
			},
			height: (h:number)=>{
				return this.$.mergely.clientHeight + "px";
			},
			width: (w:number)=>{
				return this.$.mergely.clientWidth + "px";
			}
		});
		let right = jQuery(this.mergelyDiv).mergely('cm', 'rhs');
		console.log('right hand cm = ', right);
	}	
}