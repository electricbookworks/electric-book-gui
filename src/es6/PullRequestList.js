class PullRequestList {
	constructor(parent, repo) {
		if (null==parent) {
			console.error(`parent required for PullRequestList`);
			debugger;
		}
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