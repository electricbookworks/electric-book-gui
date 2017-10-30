import {PrintListenerTerminal as Template} from './Templates';

export class PrintListenerTerminal extends Template {
	constructor() {
		super();
		let el = document.getElementById('print-listener');
		if (el) {
			el.remove();
		}
		this.$.close.addEventListener(`click`, (evt)=>{
			this.el.remove();
		});
		document.body.appendChild(this.el);
	}
	addLine(msg:string, err:boolean=false) {
		let line = document.createElement(`div`);
		line.innerText = msg;
		if (err) {
			line.classList.add('error-line');
		}
		this.$.terminal.appendChild(line);
		this.scrollBottom();
	}
	scrollBottom() {
		this.$.terminal.scrollTop = this.$.terminal.scrollHeight - this.$.terminal.clientHeight;
	}
	addError(msg:string) {
		this.addLine(msg, true);
	}
	ticktock() {
		this.$.header.classList.toggle(`tick`);
	}
	done(url: string) {
		this.$.header.classList.remove(`tick`);
		this.$.header.classList.add(`done`);
		this.$.title.innerText =  `Printing complete`;
		let line = document.createElement(`div`);
		line.innerHTML = `Your pdf is ready at <a href="${url}">${url}</a>`;
		line.classList.add(`done`);
		this.$.terminal.appendChild(line);
		this.scrollBottom();
	}
	
}