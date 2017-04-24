/**
 * AllFilesEditor is a control that allows the user to select
 * any file from the repo for editing.
 */
class AllFilesEditor {
	constructor(repoOwner, repoName, parent, dir, chooseFileCallback) {
		if (null==parent) {
			console.log(`NO parent for AllFilesEditor`);
			return;
		}
		this.repoOwner = repoOwner;
		this.repoName = repoName;

		this.dir = dir;
		this.chooseFileCallback = chooseFileCallback;
		[this.el, this.$] = DTemplate(`AllFilesEditor`)
		for (let f of dir.FileNamesOnly()) {
			if ("."!=f[0]) {
				let model = new RepoFileModel(this.repoOwner, this.repoName, f);
				new RepoFileEditLink(this.$.filesList, model,
					(_src, file)=>{
						this.chooseFileCallback(this, file);
					}
				);
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