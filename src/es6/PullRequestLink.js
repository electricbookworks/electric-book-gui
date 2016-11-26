class PullRequestLink {
	constructor(parent, repo, pr) {
		this.pr = pr;
		[this.el, this.$] = DTemplate(`PullRequestLink`)
		this.$.link.textContent = this.pr.title;
		this.$.link.href=`${repo}/pull/${this.pr.number}`;
		parent.appendChild(this.el);
	}
}