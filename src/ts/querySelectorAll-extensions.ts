export function QuerySelectorAllIterate(el:HTMLElement, query:string) : HTMLElement[] {
	let els :HTMLElement[] = [];
	if ('function'==typeof el.matches) {
		if (el.matches(query)) {
			els.push(el);
		}
	} else if ('function'==typeof (el as any).matchesSelector) {
		if ((el as any).matchesSelector(query)) {
			els.push(el as HTMLElement);
		}
	}
	let childSelector = el.querySelectorAll(query);
	for (let i=0; i<childSelector.length; i++) {
		els.push(childSelector.item(i) as HTMLElement);
	}
	return els;
}	

