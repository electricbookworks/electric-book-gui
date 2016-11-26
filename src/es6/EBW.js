let ebw_instance = null;

class EBW {
	constructor() {
		if (null==ebw_instance) {
			ebw_instance = this;
			this.api = new APIWs();
		}
		return ebw_instance;
	}
	static API() {
		let ebw = new EBW();
		return ebw.api;
	}
	static Error(err) {
		console.error('ERROR: ', err);
		alert(err);
	}
	static flatten(callback, context=null) {
		return function(argsArray) {
			callback.apply(context, argsArray);
		}
	}	
}

window.EBW = EBW;