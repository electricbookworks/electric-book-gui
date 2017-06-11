import signals = require('signals');

export enum MergeEditorAction {
	Save,
	Resolve,
	Delete,
	RevertOur,
	RevertTheir,
	RevertGit
}
// MergeEditorControlBar handles the wiring between the editor controls
// and any listeners interested in these controls
export class MergeEditorControlBar {
	public Listen : signals.Signal;

	constructor() {
		this.Listen = new signals.Signal();

		let ln = (key:string, act:MergeEditorAction) => {
			document.getElementById(`merge-editor-control-${key}`)
			.addEventListener(`click`, (evt)=>{
				evt.preventDefault(); evt.stopPropagation();
				this.Listen.dispatch(act);
			})
		}
		ln(`revert-our`, MergeEditorAction.RevertOur);
		ln(`revert-their`, MergeEditorAction.RevertTheir);
		ln(`revert-git`, MergeEditorAction.RevertGit);
		ln(`save`, MergeEditorAction.Save);
		ln(`delete`, MergeEditorAction.Delete);
		ln(`resolve`, MergeEditorAction.Resolve);
	}

}