import {MergeEditor} from './MergeEditor';
import {conflict_MergeInstructions as Template } from '../Templates';

export class MergeInstructions extends Template {
	constructor(parent: HTMLElement, editor: MergeEditor) {
		super();
		if (!parent) {
			return;
		}
		this.$.theirSide.innerHTML = editor.TheirSide();
		this.$.ourSide.innerHTML = editor.WorkingSide();

		this.$.show.addEventListener(`click`, (evt)=>{
			evt.preventDefault(); evt.stopPropagation();
			this.el.classList.toggle(`showing`);
		});

		parent.appendChild(this.el);
	}
}