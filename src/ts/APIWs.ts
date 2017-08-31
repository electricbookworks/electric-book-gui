export class APIWs {
	protected id: number;
	protected url: string;
	protected live:Map<number,[(...a:any[])=>void,(a:any)=>void]>;
	protected queue: string[];
	protected errorHandler: (a:any)=>void;
	protected ws: WebSocket;

	constructor(path:string="/rpc/API/json/ws", server:string="") {
		if (""== server) {
			server = "ws" +
				 ("https:" == document.location.protocol ? "s" : "") +
				 "://" +
				 document.location.host
		}
		this.id = 0;
		this.url = server+path;
		this.live = new Map<number,[(...a:any[])=>void,(a:any)=>void]>();
		this.queue = new Array<string>();
		this.setRPCErrorHandler(null);
		this.startWs();
	}	
	setRPCErrorHandler(handler?:(a:any)=>void) :void {
		this.errorHandler = handler;
	}
	reject(reject:(a:any)=>void,err:Error):void {
		if (this.errorHandler) {
			this.errorHandler(err);
		}
		reject(err);
		return;
	}
	startWs():void {
		this.ws = new WebSocket(this.url);
		this.ws.onmessage = (evt)=> {
			let res:any = JSON.parse(evt.data);
			if (undefined == res || undefined==res.id) {
				console.error(`Failed to parse response: ${evt.data}`);
				return;
			}
			let id = res.id as number;
			let promises = this.live.get(id);
			if (! promises) {
				console.error(`Failed to find promise for ${evt.data}`);
				return;
			}
			this.live.delete(id);
			let [resolve,reject] = promises;

			if (res.error) {
				this.reject(reject, res.error);
				return;
			}
			if (res.result) {
				resolve(res.result);
				return;
			}
			resolve(undefined);
		};
		this.ws.onerror = (err)=> {
			console.error("ERROR on websocket:", err);
		};
		this.ws.onopen = (evt)=> {
			console.log("Connected websocket");
			for (let q of this.queue) {
				this.ws.send(q);
			}
			console.log(`Emptied queue of ${this.queue.length} queued messages`);
			this.queue = [];
		};
		this.ws.onclose = (evt)=> {
			console.log("Websocket closed - attempting reconnect in 1s");
			setTimeout( ()=> this.startWs(), 1000 );
		}
	}
	rpc(method:string, params:any[]) {
		let id = this.id++;
		// // params comes in as an 'arguments' object, so we need to convert
		// // it to an array
		// params = Array.prototype.slice.call(params);
		// // let p = [];
		// // for (let i=0; i<p.length; i++) {
		// // 	p[i] = params[i]
		// // }

		let data = JSON.stringify({ id:id, method:method, params:params });
		this.live.set(id, [undefined,undefined]);
		return new Promise( (resolve:(...a:any[])=>void,reject:(a:any)=>void)=> {
			this.live.set(id,[resolve,reject]);
			if (1==this.ws.readyState) {
				this.ws.send(data);
			} else {
				this.queue.push(data);
			}
		});
	}

	
	Version () {
		return this.rpc("Version",  [] );
	}
	
	RenameFile (repoOwner:string,repoName:string,fromPath:string,toPath:string) {
		return this.rpc("RenameFile",  [repoOwner,repoName,fromPath,toPath] );
	}
	
	RemoveFile (repoOwner:string,repoName:string,path:string) {
		return this.rpc("RemoveFile",  [repoOwner,repoName,path] );
	}
	
	ListFiles (repoOwner:string,repoName:string,pathregex:string) {
		return this.rpc("ListFiles",  [repoOwner,repoName,pathregex] );
	}
	
	FileExists (repoOwner:string,repoName:string,path:string) {
		return this.rpc("FileExists",  [repoOwner,repoName,path] );
	}
	
	ListAllRepoFiles (repoOwner:string,repoName:string) {
		return this.rpc("ListAllRepoFiles",  [repoOwner,repoName] );
	}
	
	GetFile (repoOwner:string,repoName:string,path:string) {
		return this.rpc("GetFile",  [repoOwner,repoName,path] );
	}
	
	GetFileString (repoOwner:string,repoName:string,path:string) {
		return this.rpc("GetFileString",  [repoOwner,repoName,path] );
	}
	
	UpdateFile (repoOwner:string,repoName:string,path:string,content:string) {
		return this.rpc("UpdateFile",  [repoOwner,repoName,path,content] );
	}
	
	StageFile (repoOwner:string,repoName:string,path:string) {
		return this.rpc("StageFile",  [repoOwner,repoName,path] );
	}
	
	StageFileAndReturnMergingState (repoOwner:string,repoName:string,path:string) {
		return this.rpc("StageFileAndReturnMergingState",  [repoOwner,repoName,path] );
	}
	
	SaveWorkingFile (repoOwner:string,repoName:string,path:string,content:string) {
		return this.rpc("SaveWorkingFile",  [repoOwner,repoName,path,content] );
	}
	
	ListPullRequests (repoOwner:string,repoName:string) {
		return this.rpc("ListPullRequests",  [repoOwner,repoName] );
	}
	
	PullRequestDiffList (repoOwner:string,repoName:string,prNumber:number) {
		return this.rpc("PullRequestDiffList",  [repoOwner,repoName,prNumber] );
	}
	
	PullRequestVersions (repoOwner:string,repoName:string,remoteUrl:string,remoteSha:string,filePath:string) {
		return this.rpc("PullRequestVersions",  [repoOwner,repoName,remoteUrl,remoteSha,filePath] );
	}
	
	PullRequestUpdate (repoOwner:string,repoName:string,remoteSHA:string,filePath:string,data:string) {
		return this.rpc("PullRequestUpdate",  [repoOwner,repoName,remoteSHA,filePath,data] );
	}
	
	Commit (repoOwner:string,repoName:string,message:string) {
		return this.rpc("Commit",  [repoOwner,repoName,message] );
	}
	
	CommitAll (repoOwner:string,repoName:string,message:string,notes:string) {
		return this.rpc("CommitAll",  [repoOwner,repoName,message,notes] );
	}
	
	CommitOnly (repoOwner:string,repoName:string,message:string,notes:string) {
		return this.rpc("CommitOnly",  [repoOwner,repoName,message,notes] );
	}
	
	PrintPdfEndpoint (repoOwner:string,repoName:string,book:string,format:string,fileList:string) {
		return this.rpc("PrintPdfEndpoint",  [repoOwner,repoName,book,format,fileList] );
	}
	
	MergedFileCat (repoOwner:string,repoName:string,path:string) {
		return this.rpc("MergedFileCat",  [repoOwner,repoName,path] );
	}
	
	MergedFileGit (repoOwner:string,repoName:string,path:string) {
		return this.rpc("MergedFileGit",  [repoOwner,repoName,path] );
	}
	
	SaveMergingFile (repoOwner:string,repoName:string,path:string,workingExists:boolean,workingContent:string,theirExists:boolean,theirContent:string) {
		return this.rpc("SaveMergingFile",  [repoOwner,repoName,path,workingExists,workingContent,theirExists,theirContent] );
	}
	
	MergeFileOriginal (repoOwner:string,repoName:string,path:string,version:string) {
		return this.rpc("MergeFileOriginal",  [repoOwner,repoName,path,version] );
	}
	
	FindFileLists (repoOwner:string,repoName:string) {
		return this.rpc("FindFileLists",  [repoOwner,repoName] );
	}
	
	SearchForFiles (repoOwner:string,repoName:string,fileRegex:string) {
		return this.rpc("SearchForFiles",  [repoOwner,repoName,fileRegex] );
	}
	
	UpdateFileBinary (repoOwner:string,repoName:string,path:string,contentB64:string) {
		return this.rpc("UpdateFileBinary",  [repoOwner,repoName,path,contentB64] );
	}
	
}
