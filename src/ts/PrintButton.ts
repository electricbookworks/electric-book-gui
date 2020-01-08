export class PrintButton {
	constructor(protected button:HTMLElement) {
		this.button.addEventListener('click', (evt)=>{
			evt.preventDefault(); evt.stopPropagation();
			window.print();
		});
		this.button.style.visibility = 'visible';
	}
}