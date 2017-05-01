export function AddToParent(parent:(HTMLElement)=>void|HTMLElement|undefined, el: HTMLElement) {
	if (!parent) {
		return;
	}
	if ('function'==typeof parent) {
		parent(el);
		return;
	}
	parent.appendChild(el);
}