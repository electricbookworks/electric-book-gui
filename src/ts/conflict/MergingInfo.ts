
// MergingInfo is the typescript equivalent of the EBWRepoStatus which provides
// some information on how the repo came to be in a conflict state.
export class MergingInfo {
	public PRNumber : number;
	public Description: string;

	constructor(dataEl?:HTMLElement) {
		if (!dataEl) {
			dataEl = document.getElementById(`merging-info`);
		}
		let js : any = JSON.parse(dataEl.innerText);
		this.PRNumber = js.MergingPRNumber;
		this.Description = js.MergingDescription;
	}

	IsPRMerge() : boolean {
		return (0 < this.PRNumber);
	}
}