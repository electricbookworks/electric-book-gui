export class DiffPrintButton {

	constructor(protected button:HTMLElement, protected container: HTMLElement) {
		button.addEventListener('click',
			(evt)=>{
				evt.preventDefault(); evt.stopPropagation();
				window.print();
			}
		);
		this.button.style.visibility = 'visible';
	}
}
