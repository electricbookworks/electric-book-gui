import {BoundFilename as Template} from './Templates';

export class BoundFilename extends Template {
	constructor(protected repoOwner:string, protected repoName:string, protected parent:HTMLElement, editorElement: HTMLElement) {
		super();
		if (!editorElement) {
			editorElement = document.body as HTMLElement;
		}
		editorElement.addEventListener('BoundFileChanged', (evt:CustomEvent)=>{
			this.$.filename.innerText = evt.detail;
			this.$.a.href = `https://github.com/${this.repoOwner}/${this.repoName}/commits/master/${evt.detail}`;
		});
		this.parent.appendChild(this.el);
		console.log(`BoundFilename: `, this, this.el);
	}
	static SetFilename(name:string):void {
		let evt = new CustomEvent(`BoundFileChanged`, {"detail":name});
		document.body.dispatchEvent(evt);
	}
	static BindAll(repoOwner:string, repoName:string) : void {
		let els = document.querySelectorAll(`[ebw-bind="current-filename"]`);
		for (let i = 0; i<els.length; i++) {
			new BoundFilename(repoOwner, repoName, els.item(i) as HTMLElement, null);
		}
	}
}