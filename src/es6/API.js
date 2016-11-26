let api_instance = false;

class API {
	constructor() {
		if (!api_instance) {
			api_instance = new APIHttp();
		}
		return api_instance;
	}
}