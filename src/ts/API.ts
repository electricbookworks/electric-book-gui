import {APIWs} from './APIWs';

export class API extends APIWs {
	protected static singleton: API;
	constructor(path:string="/rpc/API/json/ws", server:string="") {
		if (!API.singleton) {
			super(path,server);
			API.singleton = this;
		}
		return API.singleton;
	}
}