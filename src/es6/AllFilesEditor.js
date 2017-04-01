/**
 * AllFilesEditor is a control that allows the user to select
 * any file from the repo.
 */
class AllFilesEditor {
	constructor(parent, dir, chooseFileCallback) {
		if (null==parent) {
			console.log(`NO parent for AllFilesEditor`);
			return;
		}
		this.dir = dir;
		this.chooseFileCallback = chooseFileCallback;
		[this.el, this.$] = DTemplate(`AllFilesEditor`)
		for (let f of dir.FileNamesOnly()) {
			if ("."!=f[0]) {
				let o = document.createElement(`option`);
				o.setAttribute(`value`, f);
				o.textContent = f;
				this.$.select.appendChild(o);
			}
		}
		Eventify(this.el, {
			'change': function(evt) {
				let f = this.$.select.value;
				console.log(`selected ${f}`);
				this.chooseFileCallback(this, f);
			}
		}, this);
		parent.appendChild(this.el);
	}
}