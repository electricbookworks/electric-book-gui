class MergeEditor {
	constructor(parent, model) {
		console.log(`new MergeEditor: parent=`, parent);
		this.model = model;
		[this.el, this.$] = DTemplate('MergeEditor');
		Eventify(this.el, {
			'save': function(evt) {
				evt.preventDefault();
				model.Update(this.get())
				.then()
				.catch( err=>{
					console.log(`Error on the save function`);
					EBW.Error(err);
				});
			}
		}, this);

		if ('function'==typeof parent) {
			parent(this.el);
		} else {
			parent.appendChild(this.el);
		}

		model.GetContent().then(EBW.flatten(this.mergely,this))
			.catch( EBW.Error );

	}
	get() {
		let cm = jQuery(this.mergely).mergely('cm', 'lhs');
		return cm.getDoc().getValue();
	}
	mergely(local, remote, diff) {
		this.$.mergely.textContent= ``;
		this.mergely = document.createElement(`div`);
		this.$.mergely.appendChild(this.mergely);
		let m = jQuery(this.mergely);
		console.log(`local = `, local.substring(0,50));
		console.log(`remote = `, remote.substring(0,50));
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
			lhs: function(setValue) {
				setValue(local);
			},
			rhs: function(setValue) {
				setValue(remote);
			},
			height: (h)=>{
				return this.$.mergely.clientHeight + "px";
			},
			width: (w)=>{
				return this.$.mergely.clientWidth + "px";
			}
		});
		let right = jQuery(this.mergely).mergely('cm', 'rhs');
		console.log('right hand cm = ', right);
	}	
}