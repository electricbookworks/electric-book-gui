class PullRequestDiffList {
	constructor(parent, diffs, prArgs, mergelyParent) {
		this.prArgs = prArgs;
		this.mergelyParent = mergelyParent;
		[this.el, this.$] = DTemplate(`PullRequestDiffList`);
		this.files = [];
		console.log('DIFFERENCE LIST = ', diffs);
		for (let d of diffs) {
			let f = new PRDiffModel(d, prArgs);
			console.log("DIFFERENCE: ", d);
			this.files.push(f);
			new RepoFileEditLink(this.el, f, (x, file)=>{
				this.viewDiff(f);
			});
		}
		parent.appendChild(this.el);
	}

	viewDiff(diff) {
		this.mergelyParent.textContent='';
		new MergeEditor(this.mergelyParent, diff);
	}

}

window.PullRequestDiffList = PullRequestDiffList