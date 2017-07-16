import {EBW} from './EBW';
import {API} from './API';
import {PRArgs} from './PRArgs';

import signals = require('signals');

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
interface Diff {
	path: string;
	remote_path: string;
	remote_hash: string;
	local_path: string;
	local_hash: string;
	equal: boolean;
}

export class PRDiffModel {
	public DirtySignal : signals.Signal;
	public EditingSignal : signals.Signal;

	constructor(
		protected diff: Diff,
		protected prArgs: PRArgs) 
	{

		this.DirtySignal = new signals.Signal();
		this.EditingSignal = new signals.Signal();
	}
	path() : string {
		return this.diff.path;
	}
	key() : string {
		return this.diff.remote_hash + ":" + this.diff.local_hash;
	}
	origKey():string {
		return this.key + '-original';
	}
	GetContent() : Promise<any> {
		console.log(`calling API.PullRequestVersions(`,
			JSON.stringify(this.prArgs) , this.diff.path, `)`);

		return EBW.API().PullRequestVersions(
			this.prArgs.repoOwner,
			this.prArgs.repoName,
			this.prArgs.remoteURL,
			this.prArgs.remoteSHA,
			this.diff.path);
	}
	Update(content:string):Promise<void> {
		return EBW.API().PullRequestUpdate(
			this.prArgs.repoOwner,
			this.prArgs.repoName,
			this.prArgs.remoteSHA,
			this.diff.path,
			content);
	}
}