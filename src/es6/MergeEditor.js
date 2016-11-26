class MergeEditor {
	constructor(parent, model) {
		this.model = model;
		[this.el, this.$] = DTemplate('MergeEditor');
		Eventify(this.el, {
			'save': function(evt) {
				evt.preventDefault();
				model.Update(this.get())
				.then()
				.catch( err=>EBW.Error );
			}
		}, this);

		if ('function'==typeof parent) {
			parent(this.el);
		} else {
			parent.appendChild(this.el);
		}

		model.GetContent().then(EBW.flatten(
			(local,remote)=>{
				this.mergely(local,remote);
			}
			))
		.catch(err=>{
			EBW.Error(err);
		});

	}
	get() {
		let cm = jQuery(this.mergely).mergely('cm', 'lhs');
		return cm.getDoc().getValue();
	}
	mergely(local, remote, diff) {
		this.$.mergely.textContent= ``;
		this.mergely = document.createElement(`div`);
		this.$.mergely.appendChild(this.mergely);
		let m = jQuery(this.mergely).mergely({
			cmsettings: { 
				readOnly: false, 
				lineNumbers: true,
			},
			editor_height: this.$.mergely.clientHeight,
			lhs: function(setValue) {
				setValue(local);
			},
			rhs: function(setValue) {
				setValue(remote);
			}
		});
	}	
}