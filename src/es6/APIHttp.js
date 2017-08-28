
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
	
	RenameFile(repoOwner,repoName,fromPath,toPath) {
		return this._rpc("RenameFile",  arguments );
	}
	
	RemoveFile(repoOwner,repoName,path) {
		return this._rpc("RemoveFile",  arguments );
	}
	
	ListFiles(repoOwner,repoName,pathregex) {
		return this._rpc("ListFiles",  arguments );
	}
	
	FileExists(repoOwner,repoName,path) {
		return this._rpc("FileExists",  arguments );
	}
	
	ListAllRepoFiles(repoOwner,repoName) {
		return this._rpc("ListAllRepoFiles",  arguments );
	}
	
	GetFile(repoOwner,repoName,path) {
		return this._rpc("GetFile",  arguments );
	}
	
	GetFileString(repoOwner,repoName,path) {
		return this._rpc("GetFileString",  arguments );
	}
	
	UpdateFile(repoOwner,repoName,path,content) {
		return this._rpc("UpdateFile",  arguments );
	}
	
	StageFile(repoOwner,repoName,path) {
		return this._rpc("StageFile",  arguments );
	}
	
	StageFileAndReturnMergingState(repoOwner,repoName,path) {
		return this._rpc("StageFileAndReturnMergingState",  arguments );
	}
	
	SaveWorkingFile(repoOwner,repoName,path,content) {
		return this._rpc("SaveWorkingFile",  arguments );
	}
	
	ListPullRequests(repoOwner,repoName) {
		return this._rpc("ListPullRequests",  arguments );
	}
	
	PullRequestDiffList(repoOwner,repoName,prNumber) {
		return this._rpc("PullRequestDiffList",  arguments );
	}
	
	PullRequestVersions(repoOwner,repoName,remoteUrl,remoteSha,filePath) {
		return this._rpc("PullRequestVersions",  arguments );
	}
	
	PullRequestUpdate(repoOwner,repoName,remoteSHA,filePath,data) {
		return this._rpc("PullRequestUpdate",  arguments );
	}
	
	Commit(repoOwner,repoName,message) {
		return this._rpc("Commit",  arguments );
	}
	
	CommitAll(repoOwner,repoName,message,notes) {
		return this._rpc("CommitAll",  arguments );
	}
	
	CommitOnly(repoOwner,repoName,message,notes) {
		return this._rpc("CommitOnly",  arguments );
	}
	
	PrintPdfEndpoint(repoOwner,repoName,book,format,fileList) {
		return this._rpc("PrintPdfEndpoint",  arguments );
	}
	
	MergedFileCat(repoOwner,repoName,path) {
		return this._rpc("MergedFileCat",  arguments );
	}
	
	MergedFileGit(repoOwner,repoName,path) {
		return this._rpc("MergedFileGit",  arguments );
	}
	
	SaveMergingFile(repoOwner,repoName,path,workingExists,workingContent,theirExists,theirContent) {
		return this._rpc("SaveMergingFile",  arguments );
	}
	
	MergeFileOriginal(repoOwner,repoName,path,version) {
		return this._rpc("MergeFileOriginal",  arguments );
	}
	
	FindFileLists(repoOwner,repoName) {
		return this._rpc("FindFileLists",  arguments );
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
