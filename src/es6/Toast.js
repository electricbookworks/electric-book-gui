let toast_instance = null;

class Toast {
	constructor(el=false) {
		if (null==toast_instance) {
			toast_instance = this;
			if (!el) {
				el = document.createElement(`div`);
				document.body.appendChild(el);
			}
			toast_instance.parent = el;
			toast_instance.parent.classList.add(`Toast`);
		}
		return toast_instance;
	}
	static Show(msg) {
		let T = new Toast();
		let div = document.createElement(`div`);
		div.textContent = msg;
		T.parent.appendChild(div);
		setTimeout( function() {
			div.remove();
		},2500);
		return div;
	}
}

window.Toast = Toast;