export class Toast {
	protected static singleton? : Toast;
	protected parent: HTMLElement;
	constructor(el?:HTMLElement) {
		if (!Toast.singleton) {
			if (!el) {
				el = document.createElement(`div`);
				document.body.appendChild(el);
			}
			this.parent = el;
			this.parent.classList.add(`Toast`);
			Toast.singleton = this;
		}
		return Toast.singleton;
	}
	static Show(msg:string) {
		let T = new Toast();
		let div = document.createElement(`div`);
		div.innerHTML = msg;
		T.parent.appendChild(div);
		setTimeout( function() {
			div.remove();
		},4500);
		return div;
	}
}
