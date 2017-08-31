type insertFunction = (el:HTMLElement)=>void;


export class DOMInsert {
	constructor(protected parent:HTMLElement|insertFunction) {

	}
	Insert(el:HTMLElement):void {
		if ('function'==typeof this.parent) {
			this.parent(el);
		} else {
			this.parent.appendChild(el);
		}
	}
}