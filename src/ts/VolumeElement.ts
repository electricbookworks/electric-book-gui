import {Volume} from './FS/Volume';

export class VolumeElement extends Volume {
	protected repoOwner:string;
	protected repoName:string;

	constructor(protected parent?:HTMLElement, repoOwner?:string, repoName?:string) {
		super();
		if (!parent) {
			parent = document.getElementById(`volume-element`);
		}
		if (!repoOwner) {
			repoOwner = parent.getAttribute(`repo-owner`);
		}
		if (!repoName) {
			repoName = parent.getAttribute(`repo-name`);
		}
		this.repoOwner = repoOwner;
		this.repoName  = repoName;		
	}
	Load() : Promise<void> {
		if (this.parent.hasAttribute(`data-files`)) {
			this.FromJS(JSON.parse(this.parent.getAttribute(`data-files`)));
			return Promise.resolve();
		}
		let content = this.parent.innerText.trim();
		if (``!=content) {
			this.FromJS(JSON.parse(content));
			return Promise.resolve();
		}
		this.api.ListAllRepoFiles(this.repoOwner, this.repoName)
		.then( ([js])=>{
			this.FromJS(js);
			return Promise.resolve();
		});
	}
}