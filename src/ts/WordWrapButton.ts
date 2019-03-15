export class WordWrapButton {
	protected const KEY : string = "ebw-word-wrap";

	constructor(protected button:HTMLElement, protected container: HTMLElement) {
		button.addEventListener('click',
			(evt)=>{
				evt.preventDefault(); evt.stopPropagation();
				this.toggle();
			}
		);
		this.setWordWrap(this.isWordWrap());
		this.button.style.visibility = 'visible';
	}
	isWordWrap() : boolean {
		let v = window.localStorage.getItem(this.KEY);
		if (null==v) {
			return true;
		}
		return `false`!=v;
	}
	setWordWrap(w: boolean) : void {
		window.localStorage.setItem(this.KEY, w?"true":"false");
		if (w) {
			this.button.classList.add(`wordwrap`);
			this.container.classList.add(`wordwrap`);
		} else {
			this.button.classList.remove(`wordwrap`);
			this.container.classList.remove(`wordwrap`);
		}
	}
	toggle() {
		this.setWordWrap(!this.isWordWrap());
	}
}

