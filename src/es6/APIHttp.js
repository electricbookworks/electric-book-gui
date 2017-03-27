
class API {
	constructor(path="/rpc/API/json", server="", _timeout=0) {
		this._timeout = 0;
		if (""==server) {
			server = document.location.protocol + "//" + document.location.host;
		}
		this.url = server + path;
		this.clearRPCErrorHandler();
	}
	setTimeout (ts) {
		this._timeout = ts;
	}
	setRPCErrorHandler(_errorHandler=false) {
		this._errorHandler = _errorHandler;
		if (false == this._errorHandler) {
			this._errorHandler = function(err) {
				console.error("RPC Error: ", e);
				alert("RPC ERROR: " + e);
			}
		}
	}
	clearRPCErrorHandler () {
		this._errorHandler = false;
	}
	_reject (reject,err) {
		if (false!=this._errorHandler) {
			this._errorHandler(err);
		}
		reject(err);
	}
	_rpc (method, params) {
		// params comes in as an 'arguments' object, so we need to convert
		// it to an array
		params = Array.prototype.slice.call(params);
		// let p = [];
		// for (let i=0; i<p.length; i++) {
		// 	p[i] = params[i]
		// }

		return new Promise( (resolve, reject)=>{
			let req = null;
			if (window.XMLHttpRequest) {
				req = new XMLHttpRequest()
			} else if (window.ActiveXObject) {
				req = new ActiveXObject("Microsoft.XMLHTTP")
			} else {
				this._reject(reject, "No supported HttpRequest implementation");
				return;
			}

			let bind = (resolve, reject, req) => {
				return ()=> {
					if (4==req.readyState) {
						if (200==req.status) {
							let res = req.response;
							if (null==res) {
								this._reject(reject, "Failed to parse response: " + req.response);
								return;
							}
							if (null!=res.error) {
								this._reject(reject, res.error);
								return;
							}
							if (null!=res.result) {
								resolve(res.result);
								return;
							}
							// This is a send-and-forget JSON RPC request (ie one without id)
							// We don't actually support this at this point... I think...
							resolve(null);
							return;
						}
						console.log("Request = ", req);
						this._reject(reject, "Failed with " + req.statusText);
					}
				}
			}

			req.onreadystatechange = bind(resolve, reject, req);
			req.timeout = this._timeout;
			req.open("POST", this.url + "?" + method, true);
			req.responseType = "json";
			req.send(JSON.stringify({ id: this._id++, method:method, params: params }));
		});
	}
	
	Version() {
		return this._rpc("Version",  arguments );
	}
	
	DeleteFile(repo,path) {
		return this._rpc("DeleteFile",  arguments );
	}
	
	ListFiles(repo,pathregex) {
		return this._rpc("ListFiles",  arguments );
	}
	
	GetFile(repo,path) {
		return this._rpc("GetFile",  arguments );
	}
	
	GetFileString(repo,path) {
		return this._rpc("GetFileString",  arguments );
	}
	
	UpdateFile(repo,path,content) {
		return this._rpc("UpdateFile",  arguments );
	}
	
	ListPullRequests(repo) {
		return this._rpc("ListPullRequests",  arguments );
	}
	
	PullRequestDiffList(repo,sha,regexp) {
		return this._rpc("PullRequestDiffList",  arguments );
	}
	
	PullRequestVersions(repo,remoteUrl,remoteSha,filePath) {
		return this._rpc("PullRequestVersions",  arguments );
	}
	
	PullRequestUpdate(repo,remoteSHA,filePath,data) {
		return this._rpc("PullRequestUpdate",  arguments );
	}
	
	Commit(repo,message) {
		return this._rpc("Commit",  arguments );
	}
	
	PrintPdfEndpoint(repo,book) {
		return this._rpc("PrintPdfEndpoint",  arguments );
	}
	

	flatten(callback, context=null) {
		return function(argsArray) {
			callback.apply(context, argsArray);
		}
	}
}

// Define the class in the window and make AMD compatible
window.API = API;
if (("function" == typeof window.define) && (window.define.amd)) {
	window.define("API", [], function() { return window.API; });
}
