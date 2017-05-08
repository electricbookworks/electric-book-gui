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
		return this.s.get(k);
	}
	setItem(k:string, v:string) {
		this.s.set(k,v);
	}
}

export function Store() : storageInterface {
	if (sessionStorage) {
		return sessionStorage;
	}
	return new store();
}

