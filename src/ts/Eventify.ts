import {QuerySelectorAllIterate} from './querySelectorAll-extensions';

/**
 * Eventify adds eventListeners to the given object
 * for each node in the given element and it's sub-elements
 * that has an attribute of the form:
 * data-event="event:method,event:method,..."
 * When the named event occurs on the element, the named
 * method will be called on the object.
 */
export function Eventify (el:HTMLElement, methods:any) {

	for (let e of QuerySelectorAllIterate(el, `[data-event]`)) {
		let evtList = e.getAttribute(`data-event`)
		for (let p of evtList.split(`,`)) {
			let [event, method] = p.split(':');
			if (!method) {
				method=event;
			}
			if (undefined == methods[method]) {
				console.error(`No method ${method} (from ${p}) defined on `, methods, 
					` while eventifying `, e);
				continue;
			}
			e.addEventListener(event, function(evt) {
				methods[method](evt);
			});
		}
	}
}