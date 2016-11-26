class PullRequestList {
	constructor(parent, repo) {
		this.parent = parent;
		this.api = EBW.API();
		this.api.ListPullRequests(repo).then(this.api.flatten( 
			(prlist)=>{
				for(let pr of prlist) {
					new PullRequestLink(parent, repo, pr);
				}
			})).catch( (err)=>{
			EBW.Error(err);
		})
	}
}

window.PullRequestList = PullRequestList;