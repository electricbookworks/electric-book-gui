import {LoginTokenList as Template} from './Templates';

interface Token {
	name:string;
	token:string;
}

class TokenDisplay {
	constructor(parent:HTMLElement, t:Token) {

		let a = document.createElement(`a`);
		a.setAttribute(`href`, `/github/token/${t.token}`);
		a.innerText = t.name;
		let li = document.createElement(`li`);
		li.appendChild(a);
		parent.appendChild(li);
	}
}

export class LoginTokenList extends Template {
	constructor(parent:HTMLElement) {
		super();

		this.GetTokens().map( (t)=>{
			new TokenDisplay(this.$.list, t);
		});

		this.$.add.addEventListener(`click`, (evt)=>{
			evt.preventDefault();
			let name = this.$.name.value;
			let token = this.$.token.value;
			if (``==name) {
				alert(`You need to provide a name for the new token`);
				return;
			}
			if (``==token) {
				alert(`You need to provide a token value.`);
				return;
			}
			this.AddToken({name:name,token:token});
			this.$.name.value = ``;
			this.$.token.value = ``;
		});
		parent.appendChild(this.el);
	}
	GetTokens() : Token[] {
		let js = localStorage.getItem(`ebw-token-list`);
		if (!js) {
			return [];
		}
		let t = JSON.parse(js) as Token[];
		return t;
	}
	AddToken(t:Token):void {
		let tokens = this.GetTokens();
		tokens.push(t);
		localStorage.setItem(`ebw-token-list`, JSON.stringify(tokens));
		new TokenDisplay(this.$.list, t);
	}
	static init() {
		console.log(`seeking LoginTokenList`); 
		let nodes = document.querySelectorAll(`[data-instance="LoginTokenList"]`);
		for (let i=0; i<nodes.length; i++) {
			let l = nodes.item(i) as HTMLElement;
			new LoginTokenList(l);
		}
	}
}
