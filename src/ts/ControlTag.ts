// A ControlTag controls the appearance of another div, most likely changing
// it's width or making it appear / disappear
export class ControlTag {
	constructor(protected el: HTMLElement, protected callback:(showing:boolean)=>void) {
		this.el.addEventListener(`click`, (evt)=>{
			evt.preventDefault(); evt.stopPropagation();
			this.el.classList.toggle(`showing`);
			this.callback(this.el.classList.contains(`showing`));
		})
	}
}