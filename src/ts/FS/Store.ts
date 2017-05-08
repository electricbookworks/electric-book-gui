interface storageInterface {
	clear():void;
	removeItem(k:string):void;
	getItem(k:string):string;
	setItem(k:string, v:string):void;
}

class store implements storageInterface {
	protected s:Map<string,string>;
	constructor() {
		this.s = new Map<string,string>();
	}
	clear() {
		this.s.clear();
	}
	removeItem(k:string):void {
		this.s.delete(k);
	}
	getItem(k:string):string {
		// console.log(`store::getItem(${k}) = `, this.s.get(k));
		return this.s.get(k);
	}
	setItem(k:string, v:string) {
		// console.log(`store::setItem ${k} = ${v}`);
		this.s.set(k,v);
	}
}

var singleton: store;

export function Store() : storageInterface {
	if ('undefined'!=typeof sessionStorage) {
		return sessionStorage;
	}
	if (!singleton) {
		singleton = new store();
	}
	return singleton;
}

