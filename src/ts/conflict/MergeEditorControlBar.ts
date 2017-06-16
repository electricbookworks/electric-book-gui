import {FileEvent,File} from './File';
import signals = require('signals');

export enum MergeEditorAction {
	Save,
	Resolve,
	Delete,
	RevertOur,
	RevertTheir,
	RevertGit,
	CopyWorking,
	CopyTheir
}
// MergeEditorControlBar handles the wiring between the editor controls
// and any listeners interested in these controls
export class MergeEditorControlBar {
	public Listen : signals.Signal;

	protected DeleteButton: HTMLElement;
	protected SaveButton : HTMLElement;
	protected RevertOurButton: HTMLElement;
	protected RevertGitButton: HTMLElement;
	protected RevertTheirButton: HTMLElement;
	protected CopyWorkingButton : HTMLElement;
	protected CopyTheirButton: HTMLElement;

	protected buttons: HTMLElement[];

	protected file: File;

	get(key:string) : HTMLElement {
		return document.getElementById(`merge-editor-control-${key}`) as HTMLElement;
	}
	disable(el:HTMLElement) {
		this.enable(el, false);
	}
	enable(el:HTMLElement, e:boolean=true) {
		if (e) {
			el.removeAttribute(`disabled`);
		} else {
			el.setAttribute(`disabled`,`disabled`);
		}
	}

	constructor() {
		this.Listen = new signals.Signal();

		this.DeleteButton = this.get(`delete`);
		this.SaveButton = this.get(`save`);

		this.RevertOurButton = this.get(`revert-our`);
		this.RevertTheirButton = this.get(`revert-their`);
		this.CopyWorkingButton = this.get(`copy-working`);
		this.CopyTheirButton = this.get(`copy-their`);

		this.buttons = new Array<HTMLElement>();

		let ln = (key:string, act:MergeEditorAction) => {
			let el = this.get(key);
			if (el) {
				el.addEventListener(`click`, (evt)=>{
					evt.preventDefault(); evt.stopPropagation();
					this.Listen.dispatch(act);
				});
				this.buttons.push(el);
			} else {
				console.error(`Failed to find #${key}`);
			}
		}
		ln(`revert-our`, MergeEditorAction.RevertOur);
		ln(`revert-their`, MergeEditorAction.RevertTheir);
		ln(`revert-git`, MergeEditorAction.RevertGit);
		ln(`copy-working`, MergeEditorAction.CopyWorking);
		ln(`copy-their`, MergeEditorAction.CopyTheir);
		ln(`save`, MergeEditorAction.Save);
		ln(`delete`, MergeEditorAction.Delete);
		ln(`resolve`, MergeEditorAction.Resolve);
	}
	SetFile(f:File) {
		if (this.file) {
			this.file.Listen.remove(this.fileEvent,this);
		}
		this.file = f;
		this.file.Listen.add(this.fileEvent, this);
	}
	fileEvent(source:any, e:FileEvent) {
		for (let el of this.buttons) {
			this.enable(el, undefined!=this.file);
		}
		if (!this.file) {
			return;
		}
		let f = this.file;
		if (f.WorkingFile().Exists || f.TheirFile().Exists) {
			// One or the other exists
			this.DeleteButton.removeAttribute(`disabled`);
		} else {
			this.DeleteButton.setAttribute(`disabled`,`disabled`);
		}
	}

}