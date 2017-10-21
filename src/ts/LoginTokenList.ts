import {LoginTokenList as Template, LoginTokenDisplay} from './Templates';

interface Token {
	name:string;
	token:string;
}

class TokenDisplay extends LoginTokenDisplay {
	constructor(parent:HTMLElement, protected t:Token, protected list:LoginTokenList) {
		super();

		this.$.link.href = `/github/token/${this.t.token}`;
		this.$.link.innerText = this.t.name;

		this.$.delete.addEventListener(`click`, (evt)=>{
			evt.preventDefault();
			this.el.remove();
			this.list.RemoveToken(this.t);
		})
		parent.appendChild(this.el);
	}
	static removeToken(name:string) {
		let d = document.getElementById(`token-list-item-` + t.name);
		if (d) {
			d.remove();
		}
	}
}

export class LoginTokenList extends Template {
	constructor(parent:HTMLElement) {
		super();

		this.GetTokens().map( (t)=>{
			new TokenDisplay(this.$.list, t, this);
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
				alert(`You need to provide a token value`);
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
		new TokenDisplay(this.$.list, t, this);
	}
	RemoveToken(t:Token):void {
		let tokens = this.GetTokens();
		let newt = [] as Token[];
		for (let ot of tokens) {
			if ((ot.name != t.name) || (ot.token!=t.token)) {
				newt.push(ot);
			}
		}
		localStorage.setItem(`ebw-token-list`, JSON.stringify(newt));
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
