/**
 * PRDiffModel provides a model of a single diff
 * between local and remote
 * diff =  Object { 
 *    path: "book/text/01.md", 
 *    remote_path: "/home/craig/proj/ebw/git_cache/pr_r…", 
 *    remote_hash: "e9c882ca90909485619b340312151904146…", 
 *    local_path: "/home/craig/proj/ebw/git_cache/repo…", 
 *    local_hash: "b73db84fa8269f29c7a5daade4bd21731f5…",
 *    equal: false 
 * }
 */
class PRDiffModel {
	constructor(diff, prArgs) {
		this.diff = diff;
		this.prArgs = prArgs;

		this.DirtySignal = new signals.Signal();
		this.EditingSignal = new signals.Signal();
	}
	get path() {
		return this.diff.path;
	}
	get key() {
		return this.diff.remove_hash + ":" + this.diff.local_hash;
	}
	get origKey() {
		return this.key + '-original';
	}
	GetContent() {
		return EBW.API().PullRequestVersions(
				this.prArgs['repo'],
				this.prArgs['remoteURL'],
				this.prArgs['remoteSHA'],
				this.diff.path);
	}
	Update(content) {
		return EBW.API().PullRequestUpdate(
			this.prArgs['repo'],
			this.prArgs['remoteSHA'],
			this.diff.path,
			content);
	}
}