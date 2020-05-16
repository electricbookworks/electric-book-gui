var EBW = (function (exports, tslib_1, TSFoundation) {
	'use strict';

	var WSState;
	(function (WSState) {
	    WSState[WSState["Null"] = 0] = "Null";
	    WSState[WSState["Connecting"] = 1] = "Connecting";
	    WSState[WSState["Connected"] = 2] = "Connected";
	})(WSState || (WSState = {}));
	var APIWs = /** @class */ (function () {
	    function APIWs(path, server) {
	        if (path === void 0) { path = "/rpc/API/json/ws"; }
	        if (server === void 0) { server = ""; }
	        if ("" == server) {
	            server = "ws" +
	                ("https:" == document.location.protocol ? "s" : "") +
	                "://" +
	                document.location.host;
	        }
	        this.id = 0;
	        this.url = server + path;
	        this.live = new Map();
	        this.queue = new Array();
	        this.setRPCErrorHandler(null);
	        this.wsState = WSState.Null;
	        this.startWs();
	    }
	    APIWs.prototype.setRPCErrorHandler = function (handler) {
	        this.errorHandler = handler;
	    };
	    APIWs.prototype.reject = function (reject, err) {
	        if (this.errorHandler) {
	            this.errorHandler(err);
	        }
	        reject(err);
	        return;
	    };
	    APIWs.prototype.startWs = function () {
	        var _this = this;
	        if (this.wsState != WSState.Null) {
	            return;
	        }
	        this.wsState = WSState.Connecting;
	        this.ws = new WebSocket(this.url);
	        this.ws.onmessage = function (evt) {
	            var res = JSON.parse(evt.data);
	            if (undefined == res || undefined == res.id) {
	                console.error("Failed to parse response: " + evt.data);
	                return;
	            }
	            var id = res.id;
	            var promises = _this.live.get(id);
	            if (!promises) {
	                console.error("Failed to find promise for " + evt.data);
	                return;
	            }
	            _this.live.delete(id);
	            var resolve = promises[0], reject = promises[1];
	            if (res.error) {
	                _this.reject(reject, res.error);
	                return;
	            }
	            if (res.result) {
	                resolve(res.result);
	                return;
	            }
	            resolve(undefined);
	        };
	        this.ws.onerror = function (err) {
	            console.error("ERROR on websocket:", err);
	            _this.wsState = WSState.Null;
	        };
	        this.ws.onopen = function (evt) {
	            _this.wsState = WSState.Connected;
	            console.log("Connected websocket");
	            for (var _i = 0, _a = _this.queue; _i < _a.length; _i++) {
	                var q = _a[_i];
	                _this.ws.send(q);
	            }
	            console.log("Emptied queue of " + _this.queue.length + " queued messages");
	            _this.queue = [];
	        };
	        this.ws.onclose = function (evt) {
	            console.log("Websocket closed - attempting reconnect in 1s");
	            _this.wsState = WSState.Null;
	            setTimeout(function () { return _this.startWs(); }, 1000);
	        };
	    };
	    APIWs.prototype.rpc = function (method, params) {
	        var _this = this;
	        var id = this.id++;
	        // // params comes in as an 'arguments' object, so we need to convert
	        // // it to an array
	        // params = Array.prototype.slice.call(params);
	        // // let p = [];
	        // // for (let i=0; i<p.length; i++) {
	        // // 	p[i] = params[i]
	        // // }
	        var data = JSON.stringify({ id: id, method: method, params: params });
	        this.live.set(id, [undefined, undefined]);
	        return new Promise(function (resolve, reject) {
	            if (_this.wsState == WSState.Null) {
	                _this.startWs();
	            }
	            _this.live.set(id, [resolve, reject]);
	            if ((_this.wsState == WSState.Connected) && (1 == _this.ws.readyState)) {
	                _this.ws.send(data);
	            }
	            else {
	                _this.queue.push(data);
	            }
	        });
	    };
	    APIWs.prototype.Version = function () {
	        return this.rpc("Version", []);
	    };
	    APIWs.prototype.RenameFile = function (repoOwner, repoName, fromPath, toPath) {
	        return this.rpc("RenameFile", [repoOwner, repoName, fromPath, toPath]);
	    };
	    APIWs.prototype.RemoveFile = function (repoOwner, repoName, path) {
	        return this.rpc("RemoveFile", [repoOwner, repoName, path]);
	    };
	    APIWs.prototype.ListFiles = function (repoOwner, repoName, pathregex) {
	        return this.rpc("ListFiles", [repoOwner, repoName, pathregex]);
	    };
	    APIWs.prototype.FileExists = function (repoOwner, repoName, path) {
	        return this.rpc("FileExists", [repoOwner, repoName, path]);
	    };
	    APIWs.prototype.ListAllRepoFiles = function (repoOwner, repoName) {
	        return this.rpc("ListAllRepoFiles", [repoOwner, repoName]);
	    };
	    APIWs.prototype.GetFile = function (repoOwner, repoName, path) {
	        return this.rpc("GetFile", [repoOwner, repoName, path]);
	    };
	    APIWs.prototype.GetFileString = function (repoOwner, repoName, path) {
	        return this.rpc("GetFileString", [repoOwner, repoName, path]);
	    };
	    APIWs.prototype.UpdateFile = function (repoOwner, repoName, path, content) {
	        return this.rpc("UpdateFile", [repoOwner, repoName, path, content]);
	    };
	    APIWs.prototype.StageFile = function (repoOwner, repoName, path) {
	        return this.rpc("StageFile", [repoOwner, repoName, path]);
	    };
	    APIWs.prototype.IsRepoConflicted = function (repoOwner, repoName) {
	        return this.rpc("IsRepoConflicted", [repoOwner, repoName]);
	    };
	    APIWs.prototype.StageFileAndReturnMergingState = function (repoOwner, repoName, path) {
	        return this.rpc("StageFileAndReturnMergingState", [repoOwner, repoName, path]);
	    };
	    APIWs.prototype.ListWatchers = function (repoOwner, repoName) {
	        return this.rpc("ListWatchers", [repoOwner, repoName]);
	    };
	    APIWs.prototype.ListCommits = function (repoOwner, repoName) {
	        return this.rpc("ListCommits", [repoOwner, repoName]);
	    };
	    APIWs.prototype.ListWatched = function () {
	        return this.rpc("ListWatched", []);
	    };
	    APIWs.prototype.SaveWorkingFile = function (repoOwner, repoName, path, content) {
	        return this.rpc("SaveWorkingFile", [repoOwner, repoName, path, content]);
	    };
	    APIWs.prototype.ListPullRequests = function (repoOwner, repoName) {
	        return this.rpc("ListPullRequests", [repoOwner, repoName]);
	    };
	    APIWs.prototype.PullRequestDiffList = function (repoOwner, repoName, prNumber) {
	        return this.rpc("PullRequestDiffList", [repoOwner, repoName, prNumber]);
	    };
	    APIWs.prototype.PullRequestVersions = function (repoOwner, repoName, remoteUrl, remoteSha, filePath) {
	        return this.rpc("PullRequestVersions", [repoOwner, repoName, remoteUrl, remoteSha, filePath]);
	    };
	    APIWs.prototype.PullRequestUpdate = function (repoOwner, repoName, remoteSHA, filePath, data) {
	        return this.rpc("PullRequestUpdate", [repoOwner, repoName, remoteSHA, filePath, data]);
	    };
	    APIWs.prototype.Commit = function (repoOwner, repoName, message) {
	        return this.rpc("Commit", [repoOwner, repoName, message]);
	    };
	    APIWs.prototype.CommitAll = function (repoOwner, repoName, message, notes) {
	        return this.rpc("CommitAll", [repoOwner, repoName, message, notes]);
	    };
	    APIWs.prototype.CommitOnly = function (repoOwner, repoName, message, notes) {
	        return this.rpc("CommitOnly", [repoOwner, repoName, message, notes]);
	    };
	    APIWs.prototype.PrintPdfEndpoint = function (repoOwner, repoName, book, format, fileList) {
	        return this.rpc("PrintPdfEndpoint", [repoOwner, repoName, book, format, fileList]);
	    };
	    APIWs.prototype.MergedFileCat = function (repoOwner, repoName, path) {
	        return this.rpc("MergedFileCat", [repoOwner, repoName, path]);
	    };
	    APIWs.prototype.MergedFileGit = function (repoOwner, repoName, path) {
	        return this.rpc("MergedFileGit", [repoOwner, repoName, path]);
	    };
	    APIWs.prototype.ReadFileData = function (repoOwner, repoName, version, path) {
	        return this.rpc("ReadFileData", [repoOwner, repoName, version, path]);
	    };
	    APIWs.prototype.WriteAndStageFile = function (repoOwner, repoName, path, data) {
	        return this.rpc("WriteAndStageFile", [repoOwner, repoName, path, data]);
	    };
	    APIWs.prototype.RemoveAndStageFile = function (repoOwner, repoName, path) {
	        return this.rpc("RemoveAndStageFile", [repoOwner, repoName, path]);
	    };
	    APIWs.prototype.FileExistsOurHeadTheirHead = function (repoOwner, repoName, path) {
	        return this.rpc("FileExistsOurHeadTheirHead", [repoOwner, repoName, path]);
	    };
	    APIWs.prototype.IsOurHeadInWd = function (repoOwner, repoName, path) {
	        return this.rpc("IsOurHeadInWd", [repoOwner, repoName, path]);
	    };
	    APIWs.prototype.SaveOurHeadToWd = function (repoOwner, repoName, path) {
	        return this.rpc("SaveOurHeadToWd", [repoOwner, repoName, path]);
	    };
	    APIWs.prototype.SaveTheirHeadToWd = function (repoOwner, repoName, path) {
	        return this.rpc("SaveTheirHeadToWd", [repoOwner, repoName, path]);
	    };
	    APIWs.prototype.SaveMergingFile = function (repoOwner, repoName, path, workingExists, workingContent, theirExists, theirContent) {
	        return this.rpc("SaveMergingFile", [repoOwner, repoName, path, workingExists, workingContent, theirExists, theirContent]);
	    };
	    APIWs.prototype.MergeFileOriginal = function (repoOwner, repoName, path, version) {
	        return this.rpc("MergeFileOriginal", [repoOwner, repoName, path, version]);
	    };
	    APIWs.prototype.FindFileLists = function (repoOwner, repoName) {
	        return this.rpc("FindFileLists", [repoOwner, repoName]);
	    };
	    APIWs.prototype.SearchForFiles = function (repoOwner, repoName, fileRegex) {
	        return this.rpc("SearchForFiles", [repoOwner, repoName, fileRegex]);
	    };
	    APIWs.prototype.UpdateFileBinary = function (repoOwner, repoName, path, contentB64) {
	        return this.rpc("UpdateFileBinary", [repoOwner, repoName, path, contentB64]);
	    };
	    return APIWs;
	}());

	// Context is a general class passed through to most sub-classes that allows
	// us to track the repo- and user-specific things that are common to pretty
	// much all requests. In some senses, it's a bit like a global namespace,
	// just much better controlled because it's a class we defined and pass around,
	// and can therefore modify for children if that is appropriate at some point.
	var Context = /** @class */ (function () {
	    function Context(el, Username, RepoOwner, RepoName) {
	        this.el = el;
	        this.Username = Username;
	        this.RepoOwner = RepoOwner;
	        this.RepoName = RepoName;
	        // I should probably also pass the EBW in the context,
	        // but since _all_ of the EBW methods are static, it is
	        // pretty unnecessary
	    }
	    Context.prototype.API = function () {
	        return EBW$1.API();
	    };
	    Context.prototype.EBW = function () {
	        return new EBW$1();
	    };
	    Context.prototype.GetAttribute = function (key) {
	        if (this.el) {
	            return this.el.getAttribute(key);
	        }
	        return "";
	    };
	    Context.prototype.RepoRedirect = function (path, args) {
	        var params = "";
	        if (args) {
	            var a_1 = [];
	            args.forEach(function (v, k) {
	                v = String(v).trim();
	                if (v) {
	                    a_1.push(encodeURIComponent(k) + "=" + encodeURIComponent(v));
	                }
	            });
	            if (0 < a_1.length) {
	                params = "?" + a_1.join("&");
	            }
	        }
	        var href = "/repo/" + this.RepoOwner + "/" + this.RepoName + "/" + path + params;
	        document.location.href = href;
	    };
	    return Context;
	}());

	var Toast = /** @class */ (function () {
	    function Toast(el) {
	        if (!Toast.singleton) {
	            if (!el) {
	                el = document.createElement("div");
	                document.body.appendChild(el);
	            }
	            this.parent = el;
	            this.parent.classList.add("Toast");
	            Toast.singleton = this;
	        }
	        return Toast.singleton;
	    }
	    Toast.Show = function (msg) {
	        var T = new Toast();
	        var div = document.createElement("div");
	        div.innerHTML = msg;
	        T.parent.appendChild(div);
	        setTimeout(function () {
	            div.remove();
	        }, 4500);
	        return div;
	    };
	    return Toast;
	}());

	var AddNewBookDialog = /** @class */ (function () {
	    function AddNewBookDialog() {
	        var t = AddNewBookDialog._template;
	        if (!t) {
	            var d = document.createElement('div');
	            d.innerHTML = "<div>\n\t<div>\n\t\t<h1>Add a project</h1>\n\t\t<fieldset>\n\t\t\t<label>\n\t\t\t\t<input name=\"new-project-type\" type=\"radio\" value=\"new\"/>\n\t\t\t\tStart a new project.\n\t\t\t</label>\n\t\t\t<label>\n\t\t\t\t<input type=\"radio\" value=\"collaborate\" name=\"new-project-type\"/>\n\t\t\t\tContribute to an existing project.\n\t\t\t</label>\n\t\t\t<label>\n\t\t\t\t<input type=\"radio\" value=\"adaptation\" name=\"new-project-type\"/>\n\t\t\t\tCreate an adaptation of an existing project.\n\t\t\t</label>\n\t\t</fieldset>\n\t\t<button data-event=\"click:choseType\" class=\"btn\">Next</button>\n\t</div>\n\t<div>\n\t\t<h1>New project</h1>\n\t\t<form action=\"/github/create/new\" method=\"post\">\n\t\t<input type=\"hidden\" name=\"action\" value=\"new\"/>\n\t\t<label>Enter the name for your new project. Use only letters and dashes; no spaces.\n\t\t<input type=\"text\" name=\"repo_new\" placeholder=\"e.g. MobyDick\"/>\n\t\t</label>\n\t\t<label>Enter the organization this project should belong to, or leave this field\n\t\tblank if you will yourself be the owner of this project.\n\t\t<input type=\"text\" name=\"org_name\" placeholder=\"e.g. electricbookworks\"/>\n\t\t</label>\n\t\t<label>\n\t\t\t<input type=\"checkbox\" name=\"private\" value=\"private\"/>\n\t\t\tMake this project private (must be supported by user's Github plan).\n\t\t</label>\n\t\t<input type=\"submit\" class=\"btn\" value=\"New project\"/>\n\t\t</form>\n\t</div>\n\t<div>\n\t\t<h1>Adaptation</h1>\n\t\t<form action=\"/github/create/new\" method=\"post\">\n\t\t<input type=\"hidden\" name=\"action\" value=\"new\"/>\n\t\t<label>Enter the name for your new project. Use only letters and dashes; no spaces.\n\t\t<input type=\"text\" name=\"repo_new\" placeholder=\"e.g. MobyDick\"/>\n\t\t</label>\n\t\t<label>Enter the organization this project should belong to, or leave this field\n\t\tblank if you will yourself be the owner of this project.\n\t\t<input name=\"org_name\" placeholder=\"e.g. electricbookworks\" type=\"text\"/>\n\t\t</label>\n\t\t<label>Enter the series that you will be adapting.\n\t\t<input placeholder=\"e.g. electricbookworks/electric-book\" type=\"text\" name=\"template\"/>\n\t\t</label>\n\t\t<label>\n\t\t\t<input type=\"checkbox\" name=\"private\" value=\"private\"/>\n\t\t\tMake this project private (must be supported by user's Github plan).\n\t\t</label>\n\t\t<input class=\"btn\" value=\"Create adaptation\" type=\"submit\"/>\n\t\t</form>\n\t</div>\n\t<div>\n\t\t<h1>Contributing</h1>\n\t\t<form method=\"post\" action=\"/github/create/fork\">\n\t\t<input type=\"hidden\" name=\"action\" value=\"fork\"/>\n\t\t<label>Enter the GitHub project you will contribute to as <code>owner/repo</code>.\n\t\t<input type=\"text\" name=\"collaborate_repo\" placeholder=\"e.g. electricbookworks/constitution\"/>\n\t\t</label>\n\t\t<label style=\"display:none;\">\n\t\t\t<input type=\"checkbox\" name=\"private\" value=\"private\"/>\n\t\t\tMake this project private (must be supported by user's Github plan).\n\t\t</label>\n\t\t<input type=\"submit\" class=\"btn\" value=\"Copy project\"/>\n\t\t</form>\n\t</div>\n</div>\n";
	            t = d.firstElementChild;
	            AddNewBookDialog._template = t;
	        }
	        var n = t.cloneNode(true);
	        this.$ = {
	            chooseType: n.childNodes[1],
	            newBookRadio: n.childNodes[1].childNodes[3].childNodes[1].childNodes[1],
	            collaborateRadio: n.childNodes[1].childNodes[3].childNodes[3].childNodes[1],
	            adaptationRadio: n.childNodes[1].childNodes[3].childNodes[5].childNodes[1],
	            newBook: n.childNodes[3],
	            repo_name: n.childNodes[3].childNodes[3].childNodes[3].childNodes[1],
	            org_name: n.childNodes[3].childNodes[3].childNodes[5].childNodes[1],
	            private_new: n.childNodes[3].childNodes[3].childNodes[7].childNodes[1],
	            adaptation: n.childNodes[5],
	            adaptation_repo_name: n.childNodes[5].childNodes[3].childNodes[3].childNodes[1],
	            adaptation_org_name: n.childNodes[5].childNodes[3].childNodes[5].childNodes[1],
	            template: n.childNodes[5].childNodes[3].childNodes[7].childNodes[1],
	            private_adapt: n.childNodes[5].childNodes[3].childNodes[9].childNodes[1],
	            collaborate: n.childNodes[7],
	            collaborate_repo: n.childNodes[7].childNodes[3].childNodes[3].childNodes[3],
	            private_collaborate: n.childNodes[7].childNodes[3].childNodes[5].childNodes[1],
	        };
	        /*
	        
	        
	        if (!this.$.chooseType) {
	            console.error("Failed to resolve item chooseType on path .childNodes[1] of ", n);
	            debugger;
	        } else {
	            console.log("chooseType resolved to ", this.$.chooseType);
	        }
	        
	        
	        if (!this.$.newBookRadio) {
	            console.error("Failed to resolve item newBookRadio on path .childNodes[1].childNodes[3].childNodes[1].childNodes[1] of ", n);
	            debugger;
	        } else {
	            console.log("newBookRadio resolved to ", this.$.newBookRadio);
	        }
	        
	        
	        if (!this.$.collaborateRadio) {
	            console.error("Failed to resolve item collaborateRadio on path .childNodes[1].childNodes[3].childNodes[3].childNodes[1] of ", n);
	            debugger;
	        } else {
	            console.log("collaborateRadio resolved to ", this.$.collaborateRadio);
	        }
	        
	        
	        if (!this.$.adaptationRadio) {
	            console.error("Failed to resolve item adaptationRadio on path .childNodes[1].childNodes[3].childNodes[5].childNodes[1] of ", n);
	            debugger;
	        } else {
	            console.log("adaptationRadio resolved to ", this.$.adaptationRadio);
	        }
	        
	        
	        if (!this.$.newBook) {
	            console.error("Failed to resolve item newBook on path .childNodes[3] of ", n);
	            debugger;
	        } else {
	            console.log("newBook resolved to ", this.$.newBook);
	        }
	        
	        
	        if (!this.$.repo_name) {
	            console.error("Failed to resolve item repo_name on path .childNodes[3].childNodes[3].childNodes[3].childNodes[1] of ", n);
	            debugger;
	        } else {
	            console.log("repo_name resolved to ", this.$.repo_name);
	        }
	        
	        
	        if (!this.$.org_name) {
	            console.error("Failed to resolve item org_name on path .childNodes[3].childNodes[3].childNodes[5].childNodes[1] of ", n);
	            debugger;
	        } else {
	            console.log("org_name resolved to ", this.$.org_name);
	        }
	        
	        
	        if (!this.$.private_new) {
	            console.error("Failed to resolve item private_new on path .childNodes[3].childNodes[3].childNodes[7].childNodes[1] of ", n);
	            debugger;
	        } else {
	            console.log("private_new resolved to ", this.$.private_new);
	        }
	        
	        
	        if (!this.$.adaptation) {
	            console.error("Failed to resolve item adaptation on path .childNodes[5] of ", n);
	            debugger;
	        } else {
	            console.log("adaptation resolved to ", this.$.adaptation);
	        }
	        
	        
	        if (!this.$.adaptation_repo_name) {
	            console.error("Failed to resolve item adaptation_repo_name on path .childNodes[5].childNodes[3].childNodes[3].childNodes[1] of ", n);
	            debugger;
	        } else {
	            console.log("adaptation_repo_name resolved to ", this.$.adaptation_repo_name);
	        }
	        
	        
	        if (!this.$.adaptation_org_name) {
	            console.error("Failed to resolve item adaptation_org_name on path .childNodes[5].childNodes[3].childNodes[5].childNodes[1] of ", n);
	            debugger;
	        } else {
	            console.log("adaptation_org_name resolved to ", this.$.adaptation_org_name);
	        }
	        
	        
	        if (!this.$.template) {
	            console.error("Failed to resolve item template on path .childNodes[5].childNodes[3].childNodes[7].childNodes[1] of ", n);
	            debugger;
	        } else {
	            console.log("template resolved to ", this.$.template);
	        }
	        
	        
	        if (!this.$.private_adapt) {
	            console.error("Failed to resolve item private_adapt on path .childNodes[5].childNodes[3].childNodes[9].childNodes[1] of ", n);
	            debugger;
	        } else {
	            console.log("private_adapt resolved to ", this.$.private_adapt);
	        }
	        
	        
	        if (!this.$.collaborate) {
	            console.error("Failed to resolve item collaborate on path .childNodes[7] of ", n);
	            debugger;
	        } else {
	            console.log("collaborate resolved to ", this.$.collaborate);
	        }
	        
	        
	        if (!this.$.collaborate_repo) {
	            console.error("Failed to resolve item collaborate_repo on path .childNodes[7].childNodes[3].childNodes[3].childNodes[3] of ", n);
	            debugger;
	        } else {
	            console.log("collaborate_repo resolved to ", this.$.collaborate_repo);
	        }
	        
	        
	        if (!this.$.private_collaborate) {
	            console.error("Failed to resolve item private_collaborate on path .childNodes[7].childNodes[3].childNodes[5].childNodes[1] of ", n);
	            debugger;
	        } else {
	            console.log("private_collaborate resolved to ", this.$.private_collaborate);
	        }
	        
	        */
	        this.el = n;
	    }
	    return AddNewBookDialog;
	}());
	var BoundFilename = /** @class */ (function () {
	    function BoundFilename() {
	        var t = BoundFilename._template;
	        if (!t) {
	            var d = document.createElement('div');
	            d.innerHTML = "<div class=\"bound-filename\">\n\t<span class=\"bound-filename-text\">Select a file to edit</span>\n\t<!-- <a href=\"#\" data-set=\"a\" target=\"_github\"><img src=\"/img/github-dark.svg\" /></a> -->\n</div>\n";
	            t = d.firstElementChild;
	            BoundFilename._template = t;
	        }
	        var n = t.cloneNode(true);
	        this.$ = {
	            filename: n.childNodes[1],
	        };
	        /*
	        
	        
	        if (!this.$.filename) {
	            console.error("Failed to resolve item filename on path .childNodes[1] of ", n);
	            debugger;
	        } else {
	            console.log("filename resolved to ", this.$.filename);
	        }
	        
	        */
	        this.el = n;
	    }
	    return BoundFilename;
	}());
	var CommitMessageDialog = /** @class */ (function () {
	    function CommitMessageDialog() {
	        var t = CommitMessageDialog._template;
	        if (!t) {
	            var d = document.createElement('div');
	            d.innerHTML = "<div>\n\t<h1>Title</h1>\n\t<div>Instructions</div>\n\t<fieldset>\n\t\t<label for=\"commitMessage\">Describe your changes\n\t\t<input type=\"text\" name=\"commitMessage\" id=\"commitMessage\"/>\n\t\t</label>\n\t</fieldset>\n\t<button class=\"btn\">Commit</button>\n</div>\n";
	            t = d.firstElementChild;
	            CommitMessageDialog._template = t;
	        }
	        var n = t.cloneNode(true);
	        this.$ = {
	            title: n.childNodes[1],
	            instructions: n.childNodes[3],
	            message: n.childNodes[5].childNodes[1].childNodes[1],
	            commit: n.childNodes[7],
	        };
	        /*
	        
	        
	        if (!this.$.title) {
	            console.error("Failed to resolve item title on path .childNodes[1] of ", n);
	            debugger;
	        } else {
	            console.log("title resolved to ", this.$.title);
	        }
	        
	        
	        if (!this.$.instructions) {
	            console.error("Failed to resolve item instructions on path .childNodes[3] of ", n);
	            debugger;
	        } else {
	            console.log("instructions resolved to ", this.$.instructions);
	        }
	        
	        
	        if (!this.$.message) {
	            console.error("Failed to resolve item message on path .childNodes[5].childNodes[1].childNodes[1] of ", n);
	            debugger;
	        } else {
	            console.log("message resolved to ", this.$.message);
	        }
	        
	        
	        if (!this.$.commit) {
	            console.error("Failed to resolve item commit on path .childNodes[7] of ", n);
	            debugger;
	        } else {
	            console.log("commit resolved to ", this.$.commit);
	        }
	        
	        */
	        this.el = n;
	    }
	    return CommitMessageDialog;
	}());
	var CommitSummaryListView = /** @class */ (function () {
	    function CommitSummaryListView() {
	        var t = CommitSummaryListView._template;
	        if (!t) {
	            var d = document.createElement('div');
	            d.innerHTML = "<div class=\"commit-summary-list\">\n</div>\n";
	            t = d.firstElementChild;
	            CommitSummaryListView._template = t;
	        }
	        var n = t.cloneNode(true);
	        this.$ = {
	            summaries: n,
	        };
	        /*
	        
	        
	        if (!this.$.summaries) {
	            console.error("Failed to resolve item summaries on path  of ", n);
	            debugger;
	        } else {
	            console.log("summaries resolved to ", this.$.summaries);
	        }
	        
	        */
	        this.el = n;
	    }
	    return CommitSummaryListView;
	}());
	var CommitSummaryView = /** @class */ (function () {
	    function CommitSummaryView() {
	        var t = CommitSummaryView._template;
	        if (!t) {
	            var d = document.createElement('div');
	            d.innerHTML = "<div class=\"commit-summary\">\n  <div class=\"when\"> </div>\n  <div class=\"message\"> </div>\n</div>\n";
	            t = d.firstElementChild;
	            CommitSummaryView._template = t;
	        }
	        var n = t.cloneNode(true);
	        this.$ = {
	            when: n.childNodes[1],
	            message: n.childNodes[3],
	        };
	        /*
	        
	        
	        if (!this.$.when) {
	            console.error("Failed to resolve item when on path .childNodes[1] of ", n);
	            debugger;
	        } else {
	            console.log("when resolved to ", this.$.when);
	        }
	        
	        
	        if (!this.$.message) {
	            console.error("Failed to resolve item message on path .childNodes[3] of ", n);
	            debugger;
	        } else {
	            console.log("message resolved to ", this.$.message);
	        }
	        
	        */
	        this.el = n;
	    }
	    return CommitSummaryView;
	}());
	var EditorImage = /** @class */ (function () {
	    function EditorImage() {
	        var t = EditorImage._template;
	        if (!t) {
	            var d = document.createElement('div');
	            d.innerHTML = "<div> </div>\n";
	            t = d.firstElementChild;
	            EditorImage._template = t;
	        }
	        var n = t.cloneNode(true);
	        this.$ = {};
	        /*
	        
	        */
	        this.el = n;
	    }
	    return EditorImage;
	}());
	var FileListDialog = /** @class */ (function () {
	    function FileListDialog() {
	        var t = FileListDialog._template;
	        if (!t) {
	            var d = document.createElement('div');
	            d.innerHTML = "<div>\n\t<h1>Choose a version</h1>\n\t<p>Choose the project version you want to output:</p>\n\t<ul class=\"file-list-dialog-list\">\n\t</ul>\n</div>\n";
	            t = d.firstElementChild;
	            FileListDialog._template = t;
	        }
	        var n = t.cloneNode(true);
	        this.$ = {
	            list: n.childNodes[5],
	        };
	        /*
	        
	        
	        if (!this.$.list) {
	            console.error("Failed to resolve item list on path .childNodes[5] of ", n);
	            debugger;
	        } else {
	            console.log("list resolved to ", this.$.list);
	        }
	        
	        */
	        this.el = n;
	    }
	    return FileListDialog;
	}());
	var FileListDialog_Item = /** @class */ (function () {
	    function FileListDialog_Item() {
	        var t = FileListDialog_Item._template;
	        if (!t) {
	            var d = document.createElement('div');
	            d.innerHTML = "<ul>\n\t<li data-set=\"this\">\n\t\t<input type=\"radio\" name=\"file-list\"/>\n\t\t<span/>\n\t</li>\n</ul>\n";
	            t = d.firstElementChild.childNodes[1];
	            FileListDialog_Item._template = t;
	        }
	        var n = t.cloneNode(true);
	        n = n.childNodes[1];
	        this.$ = {
	            input: n,
	            title: n,
	        };
	        /*
	        
	        
	        
	        if (!this.$.input) {
	            console.error("Failed to resolve item input on path  of ", n);
	            debugger;
	        } else {
	            console.log("input resolved to ", this.$.input);
	        }
	        
	        
	        if (!this.$.title) {
	            console.error("Failed to resolve item title on path  of ", n);
	            debugger;
	        } else {
	            console.log("title resolved to ", this.$.title);
	        }
	        
	        */
	        this.el = n;
	    }
	    return FileListDialog_Item;
	}());
	var FoundationRevealDialog = /** @class */ (function () {
	    function FoundationRevealDialog() {
	        var t = FoundationRevealDialog._template;
	        if (!t) {
	            var d = document.createElement('div');
	            d.innerHTML = "<div class=\"reveal\" id=\"new-file-dialog\" data-reveal=\"\">\n\t<div class=\"content\">\n\t</div>\n\t<button type=\"button\" data-close=\"\" class=\"close-button\" aria-label=\"Close popup\">\n\t\t<span aria-hidden=\"true\">\u00D7</span>\n\t</button>\n</div>\n";
	            t = d.firstElementChild;
	            FoundationRevealDialog._template = t;
	        }
	        var n = t.cloneNode(true);
	        this.$ = {
	            content: n.childNodes[1],
	        };
	        /*
	        
	        
	        if (!this.$.content) {
	            console.error("Failed to resolve item content on path .childNodes[1] of ", n);
	            debugger;
	        } else {
	            console.log("content resolved to ", this.$.content);
	        }
	        
	        */
	        this.el = n;
	    }
	    return FoundationRevealDialog;
	}());
	var LoginTokenDisplay = /** @class */ (function () {
	    function LoginTokenDisplay() {
	        var t = LoginTokenDisplay._template;
	        if (!t) {
	            var d = document.createElement('div');
	            d.innerHTML = "<ul>\n\t<li data-set=\"this\" class=\"token-display\">\n\t\t<a href=\"\">LINK</a>\n\t\t<a href=\"\">X</a>\n\t</li>\n</ul>\n";
	            t = d.firstElementChild.childNodes[1];
	            LoginTokenDisplay._template = t;
	        }
	        var n = t.cloneNode(true);
	        n = n.childNodes[1];
	        this.$ = {
	            link: n,
	            delete: n,
	        };
	        /*
	        
	        
	        
	        if (!this.$.link) {
	            console.error("Failed to resolve item link on path  of ", n);
	            debugger;
	        } else {
	            console.log("link resolved to ", this.$.link);
	        }
	        
	        
	        if (!this.$.delete) {
	            console.error("Failed to resolve item delete on path  of ", n);
	            debugger;
	        } else {
	            console.log("delete resolved to ", this.$.delete);
	        }
	        
	        */
	        this.el = n;
	    }
	    return LoginTokenDisplay;
	}());
	var LoginTokenList = /** @class */ (function () {
	    function LoginTokenList() {
	        var t = LoginTokenList._template;
	        if (!t) {
	            var d = document.createElement('div');
	            d.innerHTML = "<div class=\"login-token-list\">\n\t<div class=\"token-input\">\n\t\t<input type=\"text\" placeholder=\"name\"/>\n\t\t<input placeholder=\"token\" type=\"text\"/>\n\t\t<button class=\"btn\">Add</button>\n\t</div>\n\t<ul class=\"token-list\">\n\t</ul>\n</div>\n";
	            t = d.firstElementChild;
	            LoginTokenList._template = t;
	        }
	        var n = t.cloneNode(true);
	        this.$ = {
	            name: n.childNodes[1].childNodes[1],
	            token: n.childNodes[1].childNodes[3],
	            add: n.childNodes[1].childNodes[5],
	            list: n.childNodes[3],
	        };
	        /*
	        
	        
	        if (!this.$.name) {
	            console.error("Failed to resolve item name on path .childNodes[1].childNodes[1] of ", n);
	            debugger;
	        } else {
	            console.log("name resolved to ", this.$.name);
	        }
	        
	        
	        if (!this.$.token) {
	            console.error("Failed to resolve item token on path .childNodes[1].childNodes[3] of ", n);
	            debugger;
	        } else {
	            console.log("token resolved to ", this.$.token);
	        }
	        
	        
	        if (!this.$.add) {
	            console.error("Failed to resolve item add on path .childNodes[1].childNodes[5] of ", n);
	            debugger;
	        } else {
	            console.log("add resolved to ", this.$.add);
	        }
	        
	        
	        if (!this.$.list) {
	            console.error("Failed to resolve item list on path .childNodes[3] of ", n);
	            debugger;
	        } else {
	            console.log("list resolved to ", this.$.list);
	        }
	        
	        */
	        this.el = n;
	    }
	    return LoginTokenList;
	}());
	var MergeEditor = /** @class */ (function () {
	    function MergeEditor() {
	        var t = MergeEditor._template;
	        if (!t) {
	            var d = document.createElement('div');
	            d.innerHTML = "<div class=\"merge-editor\">\n\t<div class=\"action-group\">\n\t\t<button data-event=\"click:save\" class=\"btn\">Save</button>\n\t</div>\n\t<div class=\"merge-mergely\">\n\t</div>\n</div>\n";
	            t = d.firstElementChild;
	            MergeEditor._template = t;
	        }
	        var n = t.cloneNode(true);
	        this.$ = {
	            mergely: n.childNodes[3],
	        };
	        /*
	        
	        
	        if (!this.$.mergely) {
	            console.error("Failed to resolve item mergely on path .childNodes[3] of ", n);
	            debugger;
	        } else {
	            console.log("mergely resolved to ", this.$.mergely);
	        }
	        
	        */
	        this.el = n;
	    }
	    return MergeEditor;
	}());
	var PrintListenerTerminal = /** @class */ (function () {
	    function PrintListenerTerminal() {
	        var t = PrintListenerTerminal._template;
	        if (!t) {
	            var d = document.createElement('div');
	            d.innerHTML = "<div id=\"print-listener\">\n\t<div class=\"header\">\n\t\t<div class=\"title\">Printing in progress \u2026\n\t\t</div>\n\t\t<div class=\"close\">\u00D7</div>\n\t</div>\n\t<div class=\"terminal\">\n\t</div>\n</div>\n";
	            t = d.firstElementChild;
	            PrintListenerTerminal._template = t;
	        }
	        var n = t.cloneNode(true);
	        this.$ = {
	            header: n.childNodes[1],
	            title: n.childNodes[1].childNodes[1],
	            close: n.childNodes[1].childNodes[3],
	            terminal: n.childNodes[3],
	        };
	        /*
	        
	        
	        if (!this.$.header) {
	            console.error("Failed to resolve item header on path .childNodes[1] of ", n);
	            debugger;
	        } else {
	            console.log("header resolved to ", this.$.header);
	        }
	        
	        
	        if (!this.$.title) {
	            console.error("Failed to resolve item title on path .childNodes[1].childNodes[1] of ", n);
	            debugger;
	        } else {
	            console.log("title resolved to ", this.$.title);
	        }
	        
	        
	        if (!this.$.close) {
	            console.error("Failed to resolve item close on path .childNodes[1].childNodes[3] of ", n);
	            debugger;
	        } else {
	            console.log("close resolved to ", this.$.close);
	        }
	        
	        
	        if (!this.$.terminal) {
	            console.error("Failed to resolve item terminal on path .childNodes[3] of ", n);
	            debugger;
	        } else {
	            console.log("terminal resolved to ", this.$.terminal);
	        }
	        
	        */
	        this.el = n;
	    }
	    return PrintListenerTerminal;
	}());
	var PullRequestDiffList_File = /** @class */ (function () {
	    function PullRequestDiffList_File() {
	        var t = PullRequestDiffList_File._template;
	        if (!t) {
	            var d = document.createElement('div');
	            d.innerHTML = "<div>\n</div>\n";
	            t = d.firstElementChild;
	            PullRequestDiffList_File._template = t;
	        }
	        var n = t.cloneNode(true);
	        this.$ = {};
	        /*
	        
	        */
	        this.el = n;
	    }
	    return PullRequestDiffList_File;
	}());
	var RepoEditorPage_NewFileDialog = /** @class */ (function () {
	    function RepoEditorPage_NewFileDialog() {
	        var t = RepoEditorPage_NewFileDialog._template;
	        if (!t) {
	            var d = document.createElement('div');
	            d.innerHTML = "<div>\n\t<fieldset>\n\t\t<label>\n\t\t\tEnter the full path and filename for your new file.\n\t\t\t<input data-event=\"change\" type=\"text\" placeholder=\"book/text/chapter-7.md\"/>\n\t\t</label>\n\t</fieldset>\n\t<button data-event=\"click\" class=\"btn\">Create File</button>\n</div>\n";
	            t = d.firstElementChild;
	            RepoEditorPage_NewFileDialog._template = t;
	        }
	        var n = t.cloneNode(true);
	        this.$ = {
	            filename: n.childNodes[1].childNodes[1].childNodes[1],
	        };
	        /*
	        
	        
	        if (!this.$.filename) {
	            console.error("Failed to resolve item filename on path .childNodes[1].childNodes[1].childNodes[1] of ", n);
	            debugger;
	        } else {
	            console.log("filename resolved to ", this.$.filename);
	        }
	        
	        */
	        this.el = n;
	    }
	    return RepoEditorPage_NewFileDialog;
	}());
	var RepoEditorPage_RenameFileDialog = /** @class */ (function () {
	    function RepoEditorPage_RenameFileDialog() {
	        var t = RepoEditorPage_RenameFileDialog._template;
	        if (!t) {
	            var d = document.createElement('div');
	            d.innerHTML = "<div>\n\t<div class=\"error\">\n\t</div>\n\t<fieldset>\n\t\t<div>Renaming <span> </span></div>\n\t\t<label>\n\t\t\tEnter the path and filename for your new file.\n\t\t\t<input type=\"text\" placeholder=\"/book/text/chapter-7.md\" data-event=\"change\"/>\n\t\t</label>\n\t</fieldset>\n\t<button data-event=\"click\" class=\"btn\">Rename</button>\n</div>\n";
	            t = d.firstElementChild;
	            RepoEditorPage_RenameFileDialog._template = t;
	        }
	        var n = t.cloneNode(true);
	        this.$ = {
	            error: n.childNodes[1],
	            current_name: n.childNodes[3].childNodes[1].childNodes[1],
	            filename: n.childNodes[3].childNodes[3].childNodes[1],
	        };
	        /*
	        
	        
	        if (!this.$.error) {
	            console.error("Failed to resolve item error on path .childNodes[1] of ", n);
	            debugger;
	        } else {
	            console.log("error resolved to ", this.$.error);
	        }
	        
	        
	        if (!this.$.current_name) {
	            console.error("Failed to resolve item current_name on path .childNodes[3].childNodes[1].childNodes[1] of ", n);
	            debugger;
	        } else {
	            console.log("current_name resolved to ", this.$.current_name);
	        }
	        
	        
	        if (!this.$.filename) {
	            console.error("Failed to resolve item filename on path .childNodes[3].childNodes[3].childNodes[1] of ", n);
	            debugger;
	        } else {
	            console.log("filename resolved to ", this.$.filename);
	        }
	        
	        */
	        this.el = n;
	    }
	    return RepoEditorPage_RenameFileDialog;
	}());
	var RepoFileEditorCM = /** @class */ (function () {
	    function RepoFileEditorCM() {
	        var t = RepoFileEditorCM._template;
	        if (!t) {
	            var d = document.createElement('div');
	            d.innerHTML = "<div class=\"repo-file-editor-workspace\">\n\t<div class=\"repo-file-editor\">\n\t</div>\n\t<div class=\"repo-image-editor\">\n\t</div>\n</div>\n";
	            t = d.firstElementChild;
	            RepoFileEditorCM._template = t;
	        }
	        var n = t.cloneNode(true);
	        this.$ = {
	            textEditor: n.childNodes[1],
	            imageEditor: n.childNodes[3],
	        };
	        /*
	        
	        
	        if (!this.$.textEditor) {
	            console.error("Failed to resolve item textEditor on path .childNodes[1] of ", n);
	            debugger;
	        } else {
	            console.log("textEditor resolved to ", this.$.textEditor);
	        }
	        
	        
	        if (!this.$.imageEditor) {
	            console.error("Failed to resolve item imageEditor on path .childNodes[3] of ", n);
	            debugger;
	        } else {
	            console.log("imageEditor resolved to ", this.$.imageEditor);
	        }
	        
	        */
	        this.el = n;
	    }
	    return RepoFileEditorCM;
	}());
	var RepoFileViewerFile = /** @class */ (function () {
	    function RepoFileViewerFile() {
	        var t = RepoFileViewerFile._template;
	        if (!t) {
	            var d = document.createElement('div');
	            d.innerHTML = "<div class=\"repo-file-viewer-file\" title=\"Drop a file here to replace this one\">\n\t<div class=\"image\">\n\t\t<img/>\n\t</div>\n\t<div class=\"filename\"> </div>\n</div>\n";
	            t = d.firstElementChild;
	            RepoFileViewerFile._template = t;
	        }
	        var n = t.cloneNode(true);
	        this.$ = {
	            img: n.childNodes[1].childNodes[1],
	            filename: n.childNodes[3],
	        };
	        /*
	        
	        
	        if (!this.$.img) {
	            console.error("Failed to resolve item img on path .childNodes[1].childNodes[1] of ", n);
	            debugger;
	        } else {
	            console.log("img resolved to ", this.$.img);
	        }
	        
	        
	        if (!this.$.filename) {
	            console.error("Failed to resolve item filename on path .childNodes[3] of ", n);
	            debugger;
	        } else {
	            console.log("filename resolved to ", this.$.filename);
	        }
	        
	        */
	        this.el = n;
	    }
	    return RepoFileViewerFile;
	}());
	var RepoFileViewerPage = /** @class */ (function () {
	    function RepoFileViewerPage() {
	        var t = RepoFileViewerPage._template;
	        if (!t) {
	            var d = document.createElement('div');
	            d.innerHTML = "<div class=\"repo-file-viewer\">\n\t<div class=\"searchbar\">\n\t\t<input placeholder=\"Type to show and filter images, e.g. book/images/web\" type=\"text\"/>\n\t</div>\n\t<div class=\"data\">\n\t</div>\n</div>\n";
	            t = d.firstElementChild;
	            RepoFileViewerPage._template = t;
	        }
	        var n = t.cloneNode(true);
	        this.$ = {
	            search: n.childNodes[1].childNodes[1],
	            data: n.childNodes[3],
	        };
	        /*
	        
	        
	        if (!this.$.search) {
	            console.error("Failed to resolve item search on path .childNodes[1].childNodes[1] of ", n);
	            debugger;
	        } else {
	            console.log("search resolved to ", this.$.search);
	        }
	        
	        
	        if (!this.$.data) {
	            console.error("Failed to resolve item data on path .childNodes[3] of ", n);
	            debugger;
	        } else {
	            console.log("data resolved to ", this.$.data);
	        }
	        
	        */
	        this.el = n;
	    }
	    return RepoFileViewerPage;
	}());
	var Tree_NodeView = /** @class */ (function () {
	    function Tree_NodeView() {
	        var t = Tree_NodeView._template;
	        if (!t) {
	            var d = document.createElement('div');
	            d.innerHTML = "<div class=\"node\">\n\t<div class=\"name\"><span class=\"closer\"><!-- icon inserted by CSS --></span><span>NAME</span></div>\n\t<div class=\"children\"> </div>\n</div>\n";
	            t = d.firstElementChild;
	            Tree_NodeView._template = t;
	        }
	        var n = t.cloneNode(true);
	        this.$ = {
	            close: n.childNodes[1].childNodes[0],
	            name: n.childNodes[1].childNodes[1],
	            children: n.childNodes[3],
	        };
	        /*
	        
	        
	        if (!this.$.close) {
	            console.error("Failed to resolve item close on path .childNodes[1].childNodes[0] of ", n);
	            debugger;
	        } else {
	            console.log("close resolved to ", this.$.close);
	        }
	        
	        
	        if (!this.$.name) {
	            console.error("Failed to resolve item name on path .childNodes[1].childNodes[1] of ", n);
	            debugger;
	        } else {
	            console.log("name resolved to ", this.$.name);
	        }
	        
	        
	        if (!this.$.children) {
	            console.error("Failed to resolve item children on path .childNodes[3] of ", n);
	            debugger;
	        } else {
	            console.log("children resolved to ", this.$.children);
	        }
	        
	        */
	        this.el = n;
	    }
	    return Tree_NodeView;
	}());
	var conflict_ClosePRDialog = /** @class */ (function () {
	    function conflict_ClosePRDialog() {
	        var t = conflict_ClosePRDialog._template;
	        if (!t) {
	            var d = document.createElement('div');
	            d.innerHTML = "<div>\n\t<h1>Title</h1>\n\t<div>Instructions</div>\n\t<fieldset>\n\t\t<label for=\"closePR-no\">\n\t\t<input type=\"radio\" name=\"closePR\" id=\"closePR-no\" value=\"no\" data-event=\"change\"/>No\n\t\t</label>\n\t\t<label for=\"closePR-yes\">\n\t\t<input type=\"radio\" name=\"closePR\" id=\"closePR-yes\" value=\"yes\" data-event=\"change\"/>Yes\n\t\t</label>\n\t\t<label for=\"closeMessage\">Close message\n\t\t<input type=\"text\" name=\"closeMessage\" id=\"closeMessage\"/>\n\t\t</label>\n\t</fieldset> \n\t<button class=\"btn\" data-event=\"click:done\">Done</button>\n</div>\n";
	            t = d.firstElementChild;
	            conflict_ClosePRDialog._template = t;
	        }
	        var n = t.cloneNode(true);
	        this.$ = {
	            title: n.childNodes[1],
	            instructions: n.childNodes[3],
	            closePR_no: n.childNodes[5].childNodes[1].childNodes[1],
	            closePR_yes: n.childNodes[5].childNodes[3].childNodes[1],
	            closeMessage: n.childNodes[5].childNodes[5].childNodes[1],
	        };
	        /*
	        
	        
	        if (!this.$.title) {
	            console.error("Failed to resolve item title on path .childNodes[1] of ", n);
	            debugger;
	        } else {
	            console.log("title resolved to ", this.$.title);
	        }
	        
	        
	        if (!this.$.instructions) {
	            console.error("Failed to resolve item instructions on path .childNodes[3] of ", n);
	            debugger;
	        } else {
	            console.log("instructions resolved to ", this.$.instructions);
	        }
	        
	        
	        if (!this.$.closePR_no) {
	            console.error("Failed to resolve item closePR_no on path .childNodes[5].childNodes[1].childNodes[1] of ", n);
	            debugger;
	        } else {
	            console.log("closePR_no resolved to ", this.$.closePR_no);
	        }
	        
	        
	        if (!this.$.closePR_yes) {
	            console.error("Failed to resolve item closePR_yes on path .childNodes[5].childNodes[3].childNodes[1] of ", n);
	            debugger;
	        } else {
	            console.log("closePR_yes resolved to ", this.$.closePR_yes);
	        }
	        
	        
	        if (!this.$.closeMessage) {
	            console.error("Failed to resolve item closeMessage on path .childNodes[5].childNodes[5].childNodes[1] of ", n);
	            debugger;
	        } else {
	            console.log("closeMessage resolved to ", this.$.closeMessage);
	        }
	        
	        */
	        this.el = n;
	    }
	    return conflict_ClosePRDialog;
	}());
	var conflict_FileDisplay = /** @class */ (function () {
	    function conflict_FileDisplay() {
	        var t = conflict_FileDisplay._template;
	        if (!t) {
	            var d = document.createElement('div');
	            d.innerHTML = "<li class=\"file-display\">\n\t<span class=\"path\"> </span>\n\t<span class=\"status\"> </span>\n</li>\n";
	            t = d.firstElementChild;
	            conflict_FileDisplay._template = t;
	        }
	        var n = t.cloneNode(true);
	        this.$ = {
	            path: n.childNodes[1],
	            status: n.childNodes[3],
	        };
	        /*
	        
	        
	        if (!this.$.path) {
	            console.error("Failed to resolve item path on path .childNodes[1] of ", n);
	            debugger;
	        } else {
	            console.log("path resolved to ", this.$.path);
	        }
	        
	        
	        if (!this.$.status) {
	            console.error("Failed to resolve item status on path .childNodes[3] of ", n);
	            debugger;
	        } else {
	            console.log("status resolved to ", this.$.status);
	        }
	        
	        */
	        this.el = n;
	    }
	    return conflict_FileDisplay;
	}());
	var conflict_FileListDisplay = /** @class */ (function () {
	    function conflict_FileListDisplay() {
	        var t = conflict_FileListDisplay._template;
	        if (!t) {
	            var d = document.createElement('div');
	            d.innerHTML = "<ul class=\"conflict-file-list-display\">\n</ul>\n";
	            t = d.firstElementChild;
	            conflict_FileListDisplay._template = t;
	        }
	        var n = t.cloneNode(true);
	        this.$ = {};
	        /*
	        
	        */
	        this.el = n;
	    }
	    return conflict_FileListDisplay;
	}());
	var conflict_MergeImageEditor = /** @class */ (function () {
	    function conflict_MergeImageEditor() {
	        var t = conflict_MergeImageEditor._template;
	        if (!t) {
	            var d = document.createElement('div');
	            d.innerHTML = "<div id=\"merge-image-editor\" class=\"merge-image-editor\">\n\t<div>\n\t</div>\n\t<div>\n\t</div>\n</div>\n";
	            t = d.firstElementChild;
	            conflict_MergeImageEditor._template = t;
	        }
	        var n = t.cloneNode(true);
	        this.$ = {
	            ours: n.childNodes[1],
	            theirs: n.childNodes[3],
	        };
	        /*
	        
	        
	        if (!this.$.ours) {
	            console.error("Failed to resolve item ours on path .childNodes[1] of ", n);
	            debugger;
	        } else {
	            console.log("ours resolved to ", this.$.ours);
	        }
	        
	        
	        if (!this.$.theirs) {
	            console.error("Failed to resolve item theirs on path .childNodes[3] of ", n);
	            debugger;
	        } else {
	            console.log("theirs resolved to ", this.$.theirs);
	        }
	        
	        */
	        this.el = n;
	    }
	    return conflict_MergeImageEditor;
	}());
	var conflict_MergeInstructions = /** @class */ (function () {
	    function conflict_MergeInstructions() {
	        var t = conflict_MergeInstructions._template;
	        if (!t) {
	            var d = document.createElement('div');
	            d.innerHTML = "<div class=\"merge-instructions\">\n\t<div class=\"instructions-button\"> </div>\n\t<div class=\"instructions-text\">\n\t\t<h2>Working with the merge editor</h2>\n\t\t<p>The file being submitted is on the <span class=\"editor-side\">THEIRSIDE</span>.</p>\n\t\t<p>The final file you will save is on the <span class=\"editor-side\">OURSIDE</span>.</p>\n\t\t<p>Use the small buttons to the left of lines to transfer changes between sides.</p>\n\t\t<p>When you are satisfied with your changes, press 'Save' to save your changes.</p>\n\t\t<p>When you have resolved all the issues between all the files, press 'Accept'.</p>\n\t</div>\n</div>\n";
	            t = d.firstElementChild;
	            conflict_MergeInstructions._template = t;
	        }
	        var n = t.cloneNode(true);
	        this.$ = {
	            show: n.childNodes[1],
	            text: n.childNodes[3],
	            theirSide: n.childNodes[3].childNodes[3].childNodes[1],
	            ourSide: n.childNodes[3].childNodes[5].childNodes[1],
	        };
	        /*
	        
	        
	        if (!this.$.show) {
	            console.error("Failed to resolve item show on path .childNodes[1] of ", n);
	            debugger;
	        } else {
	            console.log("show resolved to ", this.$.show);
	        }
	        
	        
	        if (!this.$.text) {
	            console.error("Failed to resolve item text on path .childNodes[3] of ", n);
	            debugger;
	        } else {
	            console.log("text resolved to ", this.$.text);
	        }
	        
	        
	        if (!this.$.theirSide) {
	            console.error("Failed to resolve item theirSide on path .childNodes[3].childNodes[3].childNodes[1] of ", n);
	            debugger;
	        } else {
	            console.log("theirSide resolved to ", this.$.theirSide);
	        }
	        
	        
	        if (!this.$.ourSide) {
	            console.error("Failed to resolve item ourSide on path .childNodes[3].childNodes[5].childNodes[1] of ", n);
	            debugger;
	        } else {
	            console.log("ourSide resolved to ", this.$.ourSide);
	        }
	        
	        */
	        this.el = n;
	    }
	    return conflict_MergeInstructions;
	}());

	function QuerySelectorAllIterate(el, query) {
	    var els = [];
	    if ('function' == typeof el.matches) {
	        if (el.matches(query)) {
	            els.push(el);
	        }
	    }
	    else if ('function' == typeof el.matchesSelector) {
	        if (el.matchesSelector(query)) {
	            els.push(el);
	        }
	    }
	    var childSelector = el.querySelectorAll(query);
	    for (var i = 0; i < childSelector.length; i++) {
	        els.push(childSelector.item(i));
	    }
	    return els;
	}

	/**
	 * Eventify adds eventListeners to the given object
	 * for each node in the given element and it's sub-elements
	 * that has an attribute of the form:
	 * data-event="event:method,event:method,..."
	 * When the named event occurs on the element, the named
	 * method will be called on the object.
	 */
	function Eventify(el, methods) {
	    for (var _i = 0, _a = QuerySelectorAllIterate(el, "[data-event]"); _i < _a.length; _i++) {
	        var e = _a[_i];
	        var evtList = e.getAttribute("data-event");
	        var _loop_1 = function (p) {
	            var _a = p.split(':'), event = _a[0], method = _a[1];
	            if (!method) {
	                method = event;
	            }
	            if (undefined == methods[method]) {
	                console.error("No method " + method + " (from " + p + ") defined on ", methods, " while eventifying ", e);
	                return "continue";
	            }
	            e.addEventListener(event, function (evt) {
	                methods[method](evt);
	            });
	        };
	        for (var _b = 0, _c = evtList.split(","); _b < _c.length; _b++) {
	            var p = _c[_b];
	            _loop_1(p);
	        }
	    }
	}

	// AddNewBookDialog steps the user through two pages
	// determining what sort of new book they want to create,
	// and where the original of that book should be found:
	// ie copy the ebw electricbook template, or fork an existing
	// book.
	var AddNewBookDialog$1 = /** @class */ (function (_super) {
	    tslib_1.__extends(AddNewBookDialog, _super);
	    function AddNewBookDialog(parent) {
	        var _this = _super.call(this) || this;
	        Eventify(_this.el, {
	            'choseType': function () {
	                var newBook = _this.$.newBookRadio.checked;
	                var collaborate = _this.$.collaborateRadio.checked;
	                var adaptation = _this.$.adaptationRadio.checked;
	                if (!newBook && !collaborate && !adaptation) {
	                    alert("You need to choose one or the other");
	                    return;
	                }
	                if (newBook) {
	                    _this.$.newBook.style.display = 'block';
	                    _this.$.repo_name.focus();
	                }
	                else if (collaborate) {
	                    _this.$.collaborate.style.display = 'block';
	                    _this.$.collaborate_repo.focus();
	                }
	                else {
	                    _this.$.adaptation.style.display = 'block';
	                    _this.$.adaptation_repo_name.focus();
	                }
	                _this.$.chooseType.style.display = 'none';
	            }
	        });
	        $(parent).bind("open.zf.reveal", function (evt) {
	            _this.$.chooseType.style.display = 'block';
	            _this.$.newBookRadio.checked = false;
	            _this.$.collaborateRadio.checked = false;
	            _this.$.adaptationRadio.checked = false;
	            _this.$.newBook.style.display = 'none';
	            _this.$.repo_name.value = '';
	            _this.$.collaborate.style.display = 'none';
	            _this.$.collaborate_repo.value = '';
	            _this.$.adaptation.style.display = 'none';
	            _this.$.adaptation_repo_name.value = '';
	            _this.$.private_new.checked = false;
	            _this.$.private_adapt.checked = false;
	            _this.$.private_collaborate.checked = false;
	        });
	        parent.appendChild(_this.el);
	        return _this;
	    }
	    AddNewBookDialog.instantiate = function () {
	        var list = document.querySelectorAll("[data-instance='AddNewBookDialog']");
	        for (var i = 0; i < list.length; i++) {
	            var el = list.item(i);
	            // console.log(`qsa.forEach(`, el, `)`);
	            new AddNewBookDialog(el);
	        }
	    };
	    return AddNewBookDialog;
	}(AddNewBookDialog));

	var TokenDisplay = /** @class */ (function (_super) {
	    tslib_1.__extends(TokenDisplay, _super);
	    function TokenDisplay(parent, t, list) {
	        var _this = _super.call(this) || this;
	        _this.t = t;
	        _this.list = list;
	        _this.$.link.href = "/github/token/" + _this.t.token;
	        _this.$.link.innerText = _this.t.name;
	        _this.$.delete.addEventListener("click", function (evt) {
	            evt.preventDefault();
	            _this.el.remove();
	            _this.list.RemoveToken(_this.t);
	        });
	        parent.appendChild(_this.el);
	        return _this;
	    }
	    TokenDisplay.removeToken = function (name) {
	        var d = document.getElementById("token-list-item-" + t.name);
	        if (d) {
	            d.remove();
	        }
	    };
	    return TokenDisplay;
	}(LoginTokenDisplay));
	var LoginTokenList$1 = /** @class */ (function (_super) {
	    tslib_1.__extends(LoginTokenList, _super);
	    function LoginTokenList(parent) {
	        var _this = _super.call(this) || this;
	        _this.GetTokens().map(function (t) {
	            new TokenDisplay(_this.$.list, t, _this);
	        });
	        _this.$.add.addEventListener("click", function (evt) {
	            evt.preventDefault();
	            var name = _this.$.name.value;
	            var token = _this.$.token.value;
	            if ("" == name) {
	                alert("You need to provide a name for the new token");
	                return;
	            }
	            if ("" == token) {
	                alert("You need to provide a token value");
	                return;
	            }
	            _this.AddToken({ name: name, token: token });
	            _this.$.name.value = "";
	            _this.$.token.value = "";
	        });
	        parent.appendChild(_this.el);
	        return _this;
	    }
	    LoginTokenList.prototype.GetTokens = function () {
	        var js = localStorage.getItem("ebw-token-list");
	        if (!js) {
	            return [];
	        }
	        var t = JSON.parse(js);
	        return t;
	    };
	    LoginTokenList.prototype.AddToken = function (t) {
	        var tokens = this.GetTokens();
	        tokens.push(t);
	        localStorage.setItem("ebw-token-list", JSON.stringify(tokens));
	        new TokenDisplay(this.$.list, t, this);
	    };
	    LoginTokenList.prototype.RemoveToken = function (t) {
	        var tokens = this.GetTokens();
	        var newt = [];
	        for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
	            var ot = tokens_1[_i];
	            if ((ot.name != t.name) || (ot.token != t.token)) {
	                newt.push(ot);
	            }
	        }
	        localStorage.setItem("ebw-token-list", JSON.stringify(newt));
	    };
	    LoginTokenList.init = function () {
	        console.log("seeking LoginTokenList");
	        var nodes = document.querySelectorAll("[data-instance=\"LoginTokenList\"]");
	        for (var i = 0; i < nodes.length; i++) {
	            var l = nodes.item(i);
	            new LoginTokenList(l);
	        }
	    };
	    return LoginTokenList;
	}(LoginTokenList));

	var RepoMergeDirectButton = /** @class */ (function () {
	    function RepoMergeDirectButton(context, el) {
	        this.context = context;
	        this.el = el;
	        var href = "/repo/" + context.RepoOwner + "/" +
	            (context.RepoName + "/merge/") +
	            el.getAttribute('data-repo-merge');
	        console.log("RepoMergeDirectButton: onclick for ", el, "  = ", href);
	        el.addEventListener("click", function (evt) {
	            evt.preventDefault();
	            evt.stopPropagation();
	            document.location.href = "/repo/" + context.RepoOwner + "/" +
	                (context.RepoName + "/merge/") +
	                el.getAttribute('data-repo-merge');
	        });
	        el.classList.add("btn");
	    }
	    RepoMergeDirectButton.init = function (context) {
	        var els = document.querySelectorAll("[data-instance=\"RepoMergeButton\"]");
	        for (var i = 0; i < els.length; i++) {
	            new RepoMergeDirectButton(context, els.item(i));
	        }
	    };
	    return RepoMergeDirectButton;
	}());

	var RepoDetailPage = /** @class */ (function () {
	    function RepoDetailPage(context) {
	        this.context = context;
	        RepoMergeDirectButton.init(this.context);
	        var el = document.getElementById("cancelAllChanges");
	        if (el) {
	            el.addEventListener("click", function (evt) {
	                evt.preventDefault();
	                evt.stopPropagation();
	                EBW$1.Confirm("All your changes will be lost. This is non-recoverable. Continue?")
	                    .then(function (b) {
	                    if (b) {
	                        document.location.href = "/repo/" + context.RepoOwner + "/" + context.RepoName + "/conflict/abort";
	                        return;
	                    }
	                });
	            });
	        }
	        EBW$1.API().ListWatchers(context.RepoOwner, context.RepoName).then(function (_a) {
	            var watchers = _a[0];
	            console.log("watchers = ", watchers);
	        });
	        EBW$1.API().ListWatched().then(function (_a) {
	            var watched = _a[0];
	            console.log("watched = ", watched);
	        });
	        EBW$1.API().ListCommits(context.RepoOwner, context.RepoName).then(function (_a) {
	            var commits = _a[0];
	            console.log("commits = ", commits);
	        });
	        // let dialog = new RepoMergeDialog(context, undefined);
	        // RepoMergeButton.init(this.context, dialog);
	        // dialog.MergeEvent.add(this.mergeEvent, this);
	    }
	    return RepoDetailPage;
	}());

	// A ControlTag controls the appearance of another div, most likely changing
	// it's width or making it appear / disappear
	var ControlTag = /** @class */ (function () {
	    function ControlTag(el, callback) {
	        var _this = this;
	        this.el = el;
	        this.callback = callback;
	        this.el.addEventListener("click", function (evt) {
	            evt.preventDefault();
	            evt.stopPropagation();
	            _this.el.classList.toggle("showing");
	            _this.callback(_this.el.classList.contains("showing"));
	        });
	    }
	    return ControlTag;
	}());

	var DialogEvents;
	(function (DialogEvents) {
	    DialogEvents[DialogEvents["Opened"] = 1] = "Opened";
	    DialogEvents[DialogEvents["Closed"] = 2] = "Closed";
	})(DialogEvents || (DialogEvents = {}));
	/**
	 * FoundationRevealDialog is a class that implements
	 * a Foundation Reveal dialog. It has a public 'Events'
	 * signals.Signal that receives 'opened' and 'closed'
	 * events when the respective action happens on the dialog.
	 */
	var FoundationRevealDialog$1 = /** @class */ (function (_super) {
	    tslib_1.__extends(FoundationRevealDialog, _super);
	    function FoundationRevealDialog(openElement, content) {
	        var _this = _super.call(this) || this;
	        _this.Events = new signals.Signal();
	        _this.$el = jQuery(_this.el);
	        if (openElement) {
	            openElement.addEventListener('click', function (evt) {
	                evt.preventDefault();
	                evt.stopPropagation();
	                _this.$el.foundation('open');
	            });
	        }
	        _this.$el.bind('open.zf.reveal', function (evt) {
	            _this.Events.dispatch(DialogEvents.Opened);
	        });
	        _this.$el.bind('closed.zf.reveal', function (evt) {
	            _this.Events.dispatch(DialogEvents.Closed);
	        });
	        if (content) {
	            _this.Set(content);
	        }
	        // The el must be inserted into the DOM before Foundation is
	        // called on it, otherwise Foundation doesn't properly position
	        // the dialog.
	        document.body.appendChild(_this.el);
	        // TSFoundation required because Typescript can be really stupid.
	        TSFoundation.Reveal(_this.$el);
	        return _this;
	    }
	    // Set the content of the dialog to the given
	    // element.
	    FoundationRevealDialog.prototype.Set = function (el) {
	        this.$.content.innerText = '';
	        this.$.content.appendChild(el);
	    };
	    FoundationRevealDialog.prototype.Open = function () {
	        this.$el.foundation('open');
	    };
	    FoundationRevealDialog.prototype.Close = function () {
	        this.$el.foundation('close');
	    };
	    return FoundationRevealDialog;
	}(FoundationRevealDialog));

	var FileListDialogItem = /** @class */ (function (_super) {
	    tslib_1.__extends(FileListDialogItem, _super);
	    function FileListDialogItem(path, dialog) {
	        var _this = _super.call(this) || this;
	        _this.path = path;
	        _this.dialog = dialog;
	        _this.$.title.textContent = path;
	        _this.$.input.addEventListener('click', function (evt) {
	            evt.preventDefault();
	            evt.stopPropagation();
	            _this.dialog.Close(_this.path);
	        });
	        return _this;
	    }
	    FileListDialogItem.prototype.isSet = function () {
	        return (this.$.input.checked);
	    };
	    return FileListDialogItem;
	}(FileListDialog_Item));

	var FileListDialog$1 = /** @class */ (function (_super) {
	    tslib_1.__extends(FileListDialog, _super);
	    function FileListDialog() {
	        var _this = _super.call(this) || this;
	        _this.dialog = new FoundationRevealDialog$1(undefined, _this.el);
	        _this.dialog.Events.add(_this.dialogEvent, _this);
	        return _this;
	    }
	    FileListDialog.prototype.Close = function (filePath) {
	        this.resolve({
	            FileList: filePath,
	            Cancelled: false
	        });
	        this.resolve = undefined;
	        this.dialog.Close();
	    };
	    FileListDialog.prototype.dialogEvent = function (evt) {
	        switch (evt) {
	            case DialogEvents.Closed:
	                // If the commit button was pressed, we have resolved
	                // the promise, and have cleared this.resolve
	                if (this.resolve) {
	                    this.resolve({ Cancelled: true });
	                }
	                return;
	            case DialogEvents.Opened:
	                return;
	        }
	    };
	    // Open returns a Promise that will return a string[]. The string[]
	    // will either contain two elements: 
	    FileListDialog.prototype.Open = function (fileList) {
	        var _this = this;
	        this.$.list.innerText = "";
	        this.items = [];
	        for (var _i = 0, fileList_1 = fileList; _i < fileList_1.length; _i++) {
	            var f = fileList_1[_i];
	            var i = new FileListDialogItem(f, this);
	            this.$.list.appendChild(i.el);
	            this.items.push(i);
	        }
	        return new Promise(function (resolve, reject) {
	            _this.resolve = resolve;
	            _this.dialog.Open();
	        });
	    };
	    return FileListDialog;
	}(FileListDialog));

	var PrintListenerTerminal$1 = /** @class */ (function (_super) {
	    tslib_1.__extends(PrintListenerTerminal, _super);
	    function PrintListenerTerminal() {
	        var _this = _super.call(this) || this;
	        var el = document.getElementById('print-listener');
	        if (el) {
	            el.remove();
	        }
	        _this.$.close.addEventListener("click", function (evt) {
	            _this.el.remove();
	        });
	        document.body.appendChild(_this.el);
	        return _this;
	    }
	    PrintListenerTerminal.prototype.addLine = function (msg, err) {
	        if (err === void 0) { err = false; }
	        var line = document.createElement("div");
	        line.innerText = msg;
	        if (err) {
	            line.classList.add('error-line');
	        }
	        this.$.terminal.appendChild(line);
	        this.scrollBottom();
	    };
	    PrintListenerTerminal.prototype.scrollBottom = function () {
	        this.$.terminal.scrollTop = this.$.terminal.scrollHeight - this.$.terminal.clientHeight;
	    };
	    PrintListenerTerminal.prototype.addError = function (msg) {
	        this.addLine(msg, true);
	    };
	    PrintListenerTerminal.prototype.ticktock = function () {
	        this.$.header.classList.toggle("tick");
	    };
	    PrintListenerTerminal.prototype.done = function (url) {
	        this.$.header.classList.remove("tick");
	        this.$.header.classList.add("done");
	        this.$.title.innerText = "Printing complete";
	        var line = document.createElement("div");
	        line.innerHTML = "Your pdf is ready at <a href=\"" + url + "\" target=\"blank\">" + url + "</a>";
	        line.classList.add("done");
	        this.$.terminal.appendChild(line);
	        this.scrollBottom();
	    };
	    return PrintListenerTerminal;
	}(PrintListenerTerminal));

	var PrintListener = /** @class */ (function () {
	    function PrintListener(repoOwner, repoName, book, format) {
	        if (book === void 0) { book = "book"; }
	        if (format === void 0) { format = "print"; }
	        var _this = this;
	        this.repoOwner = repoOwner;
	        this.repoName = repoName;
	        this.book = book;
	        this.format = format;
	        this.listDialog = new FileListDialog$1();
	        if ("" == this.book) {
	            this.book = "book";
	        }
	        if (("print" != format) && ("screen" != format)) {
	            EBW$1.Error("PrintListener format parameter must be either 'print' or 'screen'");
	            return;
	        }
	        EBW$1.API().FindFileLists(repoOwner, repoName).then(function (_a) {
	            var files = _a[0];
	            // console.log(`Files directories are `, files);
	            // debugger;
	            // files.push(files[0]);
	            if (2 > files.length) {
	                return Promise.resolve(0 == files.length ? "" : files[0]);
	            }
	            return _this.listDialog.Open(files)
	                .then(function (res) {
	                if (res.Cancelled) {
	                    return Promise.resolve(undefined);
	                }
	                else {
	                    return Promise.resolve(res.FileList);
	                }
	            });
	        }).then(function (filedir) {
	            if ('undefined' == typeof filedir) {
	                return Promise.resolve([undefined]);
	            }
	            return EBW$1.API().PrintPdfEndpoint(repoOwner, repoName, book, format, filedir);
	        }).then(function (_a) {
	            var url = _a[0];
	            if ('undefined' == typeof url) {
	                return;
	            }
	            _this.startListener(url);
	        }).catch(EBW$1.Error);
	    }
	    PrintListener.prototype.startListener = function (key) {
	        var _this = this;
	        var terminal = new PrintListenerTerminal$1();
	        var url = document.location.protocol +
	            "//" +
	            document.location.host + "/print/sse/" + key;
	        var sse = new EventSource(url);
	        sse.addEventListener("open", function () {
	        });
	        sse.addEventListener('tick', function (e) {
	            terminal.ticktock();
	        });
	        sse.addEventListener("info", function (e) {
	            // console.log(`INFO on printListener: `, e.data);
	            var data = JSON.parse(e.data);
	            terminal.addLine(data.log);
	        });
	        sse.addEventListener("log", function (e) {
	            var data = JSON.parse(e.data);
	            terminal.addLine(data.log);
	        });
	        sse.addEventListener("error", function (e) {
	            var err = JSON.parse(e.data);
	            EBW$1.Error(err);
	            sse.close();
	            terminal.addError(err.log);
	        });
	        sse.addEventListener("output", function (e) {
	            var data = JSON.parse(e.data);
	            var url = document.location.protocol +
	                "//" +
	                document.location.host +
	                ("/www/" + _this.repoOwner + "/" + _this.repoName + "/" + data);
	            EBW$1.Toast("Your PDF is ready: opening in a new window.");
	            terminal.done(url);
	            window.open(url, _this.repoOwner + "-" + _this.repoName + "-pdf");
	        });
	        sse.addEventListener("done", function (e) {
	            sse.close();
	        });
	        sse.onmessage = function (e) {
	            _this.onmessage(e);
	        };
	        sse.onerror = EBW$1.Error;
	    };
	    PrintListener.prototype.onmessage = function (e) {
	        console.log("PrintListener.onmessage: ", e);
	    };
	    return PrintListener;
	}());

	var BoundFilename$1 = /** @class */ (function (_super) {
	    tslib_1.__extends(BoundFilename, _super);
	    function BoundFilename(repoOwner, repoName, parent, editorElement) {
	        var _this = _super.call(this) || this;
	        _this.repoOwner = repoOwner;
	        _this.repoName = repoName;
	        _this.parent = parent;
	        if (!editorElement) {
	            editorElement = document.body;
	        }
	        editorElement.addEventListener('BoundFileChanged', function (evt) {
	            _this.$.filename.innerText = evt.detail;
	            // Not currently used. Adds a link to GitHub.
	            // this.$.a.href = `https://github.com/${this.repoOwner}/${this.repoName}/commits/master/${evt.detail}`;
	        });
	        _this.parent.appendChild(_this.el);
	        console.log("BoundFilename: ", _this, _this.el);
	        return _this;
	    }
	    BoundFilename.SetFilename = function (name) {
	        var evt = new CustomEvent("BoundFileChanged", { "detail": name });
	        document.body.dispatchEvent(evt);
	    };
	    BoundFilename.BindAll = function (repoOwner, repoName) {
	        var els = document.querySelectorAll("[ebw-bind=\"current-filename\"]");
	        for (var i = 0; i < els.length; i++) {
	            new BoundFilename(repoOwner, repoName, els.item(i), null);
	        }
	    };
	    return BoundFilename;
	}(BoundFilename));

	var EditorCodeMirror = /** @class */ (function () {
	    function EditorCodeMirror(parent) {
	        this.cm = CodeMirror(parent, {
	            'mode': 'markdown',
	            'lineNumbers': true,
	            'lineWrapping': true
	        });
	    }
	    EditorCodeMirror.Template = function () {
	        return 'RepoFileEditor_codemirror';
	    };
	    EditorCodeMirror.prototype.getValue = function () {
	        return this.cm.getDoc().getValue();
	    };
	    EditorCodeMirror.prototype.setValue = function (s) {
	        this.cm.getDoc().setValue(s);
	        this.cm.refresh();
	    };
	    EditorCodeMirror.prototype.getHistory = function () {
	        return JSON.stringify(this.cm.getHistory());
	    };
	    EditorCodeMirror.prototype.setHistory = function (hist) {
	        if (hist) {
	            this.cm.setHistory(JSON.parse(hist));
	        }
	        else {
	            this.cm.clearHistory();
	        }
	    };
	    /**
	     * focus sets the input focus to the editor
	     */
	    EditorCodeMirror.prototype.focus = function () {
	        this.cm.focus();
	    };
	    /**
	     * setModeOnFilename sets the editor mode / highlighting
	     * based on the filename of the file you're editing.
	     */
	    EditorCodeMirror.prototype.setModeOnFilename = function (filename) {
	        var r = /\.([^\.]+)$/;
	        var res = r.exec(filename);
	        if (res != null && 2 == res.length) {
	            var suffix = res[1];
	            var modes = new Map();
	            modes.set('md', 'markdown');
	            modes.set('js', 'javascript');
	            modes.set('css', 'css');
	            modes.set('scss', 'sass');
	            modes.set('sass', 'sass');
	            modes.set('yaml', 'yaml');
	            modes.set('yml', 'yaml');
	            modes.set('xml', 'xml');
	            var mode = modes.get(res[1]);
	            if (mode) {
	                this.cm.setOption("mode", mode);
	            }
	        }
	    };
	    return EditorCodeMirror;
	}());

	function AddToParent(parent, el) {
	    if (!parent) {
	        return;
	    }
	    if ('function' == typeof parent) {
	        parent(el);
	        return;
	    }
	    parent.appendChild(el);
	}

	var EditorImage$1 = /** @class */ (function (_super) {
	    tslib_1.__extends(EditorImage, _super);
	    function EditorImage(parent, repoOwner, repoName) {
	        var _this = _super.call(this) || this;
	        _this.parent = parent;
	        _this.repoOwner = repoOwner;
	        _this.repoName = repoName;
	        AddToParent(parent, _this.el);
	        return _this;
	    }
	    EditorImage.prototype.setFile = function (f) {
	        this.file = f;
	        var imageUrl = "url('/www/" +
	            (this.repoOwner + "/" + this.repoName + "/" + f.Name() + "')");
	        this.el.style.backgroundImage = imageUrl;
	    };
	    return EditorImage;
	}(EditorImage));

	/**
	 * FileState provides information on the status of a file
	 * in a given filesystem vis-a-vis its parent
	 * filesystem.
	 */
	var FileState;
	(function (FileState) {
	    FileState[FileState["New"] = 1] = "New";
	    FileState[FileState["Deleted"] = 2] = "Deleted";
	    FileState[FileState["Absent"] = 3] = "Absent";
	    FileState[FileState["Changed"] = 4] = "Changed";
	    FileState[FileState["Unchanged"] = 5] = "Unchanged";
	    FileState[FileState["Undefined"] = 6] = "Undefined"; // Typically if there is not parent FS
	})(FileState || (FileState = {}));
	function SetFileStateCSS(el, fs) {
	    // console.log(`SetFileStateCSS = el=`, el, `, fs=`, FileStateString(fs));
	    if (fs == undefined || fs == FileState.Undefined) {
	        console.log("in SetFileStateCSS: fs=", fs);
	    }
	    for (var _i = 0, _a = [FileState.New, FileState.Deleted, FileState.Absent, FileState.Changed, FileState.Unchanged]; _i < _a.length; _i++) {
	        var s = _a[_i];
	        var c = 'state-' + FileStateString(s);
	        el.classList.remove(c);
	        if (fs == s) {
	            el.classList.add(c);
	        }
	    }
	}
	function FileStateString(fs) {
	    switch (fs) {
	        case FileState.New: return "new";
	        case FileState.Deleted: return "deleted";
	        case FileState.Absent: return "absent";
	        case FileState.Changed: return "changed";
	        case FileState.Unchanged: return "unchanged";
	        case FileState.Undefined: return "--UNDEFINED--";
	    }
	    return "UNKNOWN STATE: fs = ${fs}";
	}

	var ImageIdentify = /** @class */ (function () {
	    function ImageIdentify() {
	    }
	    ImageIdentify.isImage = function (name) {
	        var imgRegexp = new RegExp(".*.(jpg|png|tiff|svg|gif)$");
	        return imgRegexp.test(name);
	    };
	    return ImageIdentify;
	}());

	var EditorEvents;
	(function (EditorEvents) {
	    EditorEvents[EditorEvents["Saved"] = 1] = "Saved";
	    EditorEvents[EditorEvents["Changed"] = 2] = "Changed";
	    EditorEvents[EditorEvents["Loaded"] = 3] = "Loaded";
	    EditorEvents[EditorEvents["Unloaded"] = 4] = "Unloaded";
	})(EditorEvents || (EditorEvents = {}));
	/**
	 * EditorEvent is the event sent by the RepoFileEditor when a file is being edited, saved, or
	 * a new file is being loaded.
	 */
	var EditorEvent = /** @class */ (function () {
	    function EditorEvent(event, file) {
	        if (file === void 0) { file = undefined; }
	        this.event = event;
	        this.file = file;
	    }
	    EditorEvent.Saved = function (f) {
	        return new EditorEvent(EditorEvents.Saved, f);
	    };
	    EditorEvent.Changed = function (f) {
	        return new EditorEvent(EditorEvents.Changed, f);
	    };
	    EditorEvent.Loaded = function (f) {
	        if (f === void 0) { f = undefined; }
	        return new EditorEvent(EditorEvents.Loaded, f);
	    };
	    EditorEvent.Unloaded = function (f) {
	        return new EditorEvent(EditorEvents.Unloaded, f);
	    };
	    EditorEvent.prototype.File = function () { return this.file; };
	    EditorEvent.prototype.Event = function () { return this.event; };
	    return EditorEvent;
	}());
	/**
	 * repoEditorActionBar provides the buttons that are used to interact with the editor for
	 * saving, undoing and deleting.
	 */
	var repoEditorActionBar = /** @class */ (function () {
	    function repoEditorActionBar(editor) {
	        var _this = this;
	        this.editor = editor;
	        this.saveButton = document.getElementById("editor-save-button");
	        this.saveButton.addEventListener("click", function (evt) {
	            evt.preventDefault();
	            _this.editor.saveEditorFile();
	        });
	        this.undoButton = document.getElementById("editor-undo-button");
	        this.undoButton.addEventListener("click", function (evt) {
	            evt.preventDefault();
	            _this.editor.undoEditorFile();
	        });
	        this.deleteButton = document.getElementById("editor-delete-button");
	        this.deleteButton.addEventListener("click", function (evt) {
	            evt.preventDefault();
	            _this.editor.deleteEditorFile();
	        });
	        this.renameButton = document.getElementById("editor-rename-button");
	        this.editor.Listeners.add(this.EditorEvents, this);
	    }
	    repoEditorActionBar.prototype.EditorEvents = function (ev) {
	        // console.log(`repoEditoActionBar.EditorEvents: ev = `, ev);
	        var file = ev.File();
	        if (!file) {
	            this.deleteButton.disabled = true;
	            this.deleteButton.innerText = 'Delete file';
	            this.saveButton.disabled = true;
	            this.undoButton.disabled = true;
	            this.renameButton.disabled = true;
	            return;
	        }
	        this.deleteButton.disabled = false;
	        this.saveButton.disabled = false;
	        this.undoButton.disabled = false;
	        this.renameButton.disabled = false;
	        //console.log(`repoEditorActionBar: file = `, file.FileContent() ? FileStatString(file.FileContent().Stat) : "", file );
	        this.deleteButton.innerText = (file.IsDeleted()) ? "Undelete file" : "Delete file";
	    };
	    return repoEditorActionBar;
	}());
	/**
	 * RepoFileEditorCM is a file editor that wraps what was meant to be
	 * a generic editor, but in actual fact turns out to have some
	 * dependencies upon CodeMirror, and hence isn't entirely generic.
	 */
	var RepoFileEditorCM$1 = /** @class */ (function (_super) {
	    tslib_1.__extends(RepoFileEditorCM, _super);
	    function RepoFileEditorCM(repoOwner, repoName, parent, callbacks, FS) {
	        var _this = _super.call(this) || this;
	        _this.parent = parent;
	        _this.callbacks = callbacks;
	        _this.FS = FS;
	        _this.undoKey = "RepoFileEditorCM:UndoHistory:" + encodeURIComponent(repoOwner) + ":" + encodeURIComponent(repoName) + ":";
	        _this.Listeners = new signals.Signal();
	        new repoEditorActionBar(_this);
	        _this.Listeners.dispatch(EditorEvent.Loaded());
	        _this.textEditor = new EditorCodeMirror(_this.$.textEditor);
	        _this.imageEditor = new EditorImage$1(_this.$.imageEditor, repoOwner, repoName);
	        _this.parent.appendChild(_this.el);
	        BoundFilename$1.BindAll(repoOwner, repoName);
	        return _this;
	    }
	    RepoFileEditorCM.prototype.undoEditorFile = function () {
	        var _this = this;
	        EBW$1.Confirm("Undo the changes you've just made to " + this.file.Name() + "?")
	            .then(function (b) {
	            if (!b)
	                return;
	            _this.FS.Revert(_this.file.Name())
	                .then(function (f) {
	                console.log("RepoFileEditorCM.undoEditorFile: Revert returned file=", f);
	                _this.file = f;
	                f.DataEvenIfDeleted()
	                    .then(function (raw) {
	                    if ('undefined' == typeof raw) {
	                        raw = '';
	                    }
	                    _this.textEditor.setValue(raw);
	                    _this.Listeners.dispatch(EditorEvent.Changed(_this.file));
	                });
	            }).catch(EWB.Error);
	        });
	    };
	    /**
	     * deleteEditorFile handles file deleting and undeleting.
	     */
	    RepoFileEditorCM.prototype.deleteEditorFile = function () {
	        var _this = this;
	        if (!this.file) {
	            EBW$1.Alert("Please choose a file before using delete/undelete");
	            return;
	        }
	        // Need to check that this is a text file... no, I won't get deleteEditorFile _unless_
	        // this is a text file.
	        this.file.data = this.textEditor.getValue();
	        var file = this.file;
	        this.FS.FileState(file.Name())
	            .then(function (fs) {
	            if (fs == FileState.Deleted) {
	                // Actually want to undo this deletion
	                // this.file.SetFileContent(fc.Content);
	                file.DataEvenIfDeleted()
	                    .then(function (raw) {
	                    _this.FS.Write(file.Name(), raw);
	                })
	                    .then(function (f) {
	                    if (_this.file.Name() == file.Name()) {
	                        _this.file = f;
	                    }
	                    return Promise.resolve();
	                })
	                    .catch(EBW$1.Error);
	                _this.Listeners.dispatch(EditorEvent.Changed(file));
	            }
	            else {
	                EBW$1.Confirm("Are you sure you want to delete " + file.Name() + "?")
	                    .then(function () {
	                    return _this.FS.Remove(file.Name());
	                })
	                    .then(function () { return _this.FS.Sync(file.Name()); })
	                    .then(function (f) {
	                    if (_this.file.Name() == file.Name()) {
	                        _this.Listeners.dispatch(EditorEvent.Unloaded(_this.file));
	                        _this.file = undefined;
	                        _this.setFile(undefined);
	                        _this.Listeners.dispatch(EditorEvent.Loaded(undefined));
	                    }
	                })
	                    .catch(EBW$1.Error);
	            }
	        });
	    };
	    RepoFileEditorCM.prototype.saveEditorFile = function (showToast) {
	        var _this = this;
	        if (showToast === void 0) { showToast = true; }
	        /* @TODO Need to ensure that no file-load occurs during file-save */
	        var f = this.file;
	        if ("undefined" == typeof this.file) {
	            return; // No file being edited
	        }
	        var fileText = this.textEditor.getValue();
	        this.FS.Write(f.Name(), fileText)
	            .then(function (f) {
	            return _this.FS.Sync(f.Name());
	        })
	            .then(function (f) {
	            /* In the following code, we need to check that we're
	             * still editing the file we are saving. If somebody has
	             * started editing a different file, we can't change the
	             * editors state.
	             */
	            if (!f.exists) {
	                if (showToast)
	                    EBW$1.Toast(f.Name() + " removed");
	                if (_this.file.Name() == f.Name()) {
	                    // By presetting file to undefined, we ensure that
	                    // setFile doesn't save the file again
	                    _this.file = undefined;
	                    _this.setFile(undefined);
	                    _this.Listeners.dispatch(EditorEvent.Loaded(undefined));
	                }
	            }
	            else {
	                if (showToast)
	                    EBW$1.Toast(f.Name() + " saved.");
	                if (_this.file.Name() == f.Name()) {
	                    _this.file = f;
	                    _this.Listeners.dispatch(EditorEvent.Changed(_this.file));
	                }
	            }
	        })
	            .catch(function (err) {
	            console.error(err);
	            EBW$1.Error(err);
	        });
	    };
	    RepoFileEditorCM.prototype.setText = function (text) {
	        if ('string' != typeof text) {
	            debugger;
	        }
	        this.textEditor.setValue(text);
	    };
	    /**
	     * saveHistoryFor saves the history for the given path
	     */
	    RepoFileEditorCM.prototype.saveHistoryFor = function (path) {
	        var key = this.undoKey + path;
	        sessionStorage.setItem(key, this.textEditor.getHistory());
	    };
	    /**
	     * restoreHistoryFor restores the history for the given
	     * path
	     */
	    RepoFileEditorCM.prototype.restoreHistoryFor = function (path) {
	        var key = this.undoKey + path;
	        this.textEditor.setHistory(sessionStorage.getItem(key));
	    };
	    RepoFileEditorCM.prototype.setFile = function (file) {
	        var _this = this;
	        if (this.file) {
	            if (this.file.Name() == file.Name()) {
	                console.log("We're already editing " + file.Name() + " \u2013 nothing to do");
	                // Cannot set to the file we're currently editing
	                return;
	            }
	            this.file.data = this.textEditor.getValue();
	            this.FS.Set(this.file);
	            this.saveHistoryFor(this.file.Name());
	            this.Listeners.dispatch(EditorEvent.Unloaded(this.file));
	            this.file = undefined;
	        }
	        if ('undefined' == typeof file) {
	            this.file = undefined;
	            this.setText('Select a file to edit.');
	            this.setBoundFilenames();
	            this.Listeners.dispatch(EditorEvent.Loaded(undefined));
	            return;
	        }
	        if (ImageIdentify.isImage(file.Name())) {
	            this.imageEditor.setFile(file);
	            this.showImageEditor();
	            this.file = undefined;
	            this.Listeners.dispatch(EditorEvent.Loaded(undefined));
	            return;
	        }
	        this.showTextEditor();
	        this.loadingFile = file;
	        file.DataEvenIfDeleted()
	            .then(function (t) {
	            // If we start loading file A, then start loading file
	            // B, and file B returns before file A, when file A
	            // returns, we are configuring ourselves as file A when
	            // in fact we should be file B.
	            // This if statement catches an 'out-of-sequence' 
	            // loaded A, and just ignores it, since we are now loading
	            // B.
	            if (_this.loadingFile.Name() != file.Name()) {
	                console.log("Caught the file-arrived-out-of-sync error for file " + file.Name());
	                return;
	            }
	            _this.file = file;
	            _this.setBoundFilenames();
	            _this.setText(t);
	            _this.restoreHistoryFor(_this.file.Name());
	            _this.textEditor.setModeOnFilename(file.Name());
	            _this.textEditor.focus();
	            // HAD BEEN .Changed
	            _this.Listeners.dispatch(EditorEvent.Loaded(_this.file));
	        })
	            .catch(EBW$1.Error);
	    };
	    RepoFileEditorCM.prototype.File = function () { return this.file; };
	    RepoFileEditorCM.prototype.Rename = function (name) {
	        var _this = this;
	        var oldfile = this.file;
	        var newfile = this.file;
	        return this.FS.Move(oldfile.Name(), name)
	            .then(function (f) {
	            return _this.FS.Sync(oldfile.Name())
	                .then(function (f) { return _this.FS.Sync(name); });
	        })
	            .then(function (f) {
	            if (_this.file.Name() == oldfile.Name()) {
	                _this.Listeners.dispatch(EditorEvent.Unloaded(oldfile));
	                _this.file = f;
	                BoundFilename$1.SetFilename(name);
	                _this.Listeners.dispatch(EditorEvent.Loaded(_this.file));
	            }
	            return Promise.resolve();
	        });
	    };
	    RepoFileEditorCM.prototype.setBoundFilenames = function () {
	        var filename = 'CHOOSE A FILE';
	        if (this.file) {
	            filename = this.file.Name();
	        }
	        BoundFilename$1.SetFilename(filename);
	    };
	    RepoFileEditorCM.prototype.showImageEditor = function () {
	        this.$.textEditor.style.display = 'none';
	        this.$.imageEditor.style.display = 'block';
	    };
	    RepoFileEditorCM.prototype.showTextEditor = function () {
	        this.$.textEditor.style.display = 'block';
	        this.$.imageEditor.style.display = 'none';
	    };
	    return RepoFileEditorCM;
	}(RepoFileEditorCM));

	/**
	 * RepoEditorPage_NewFileDialog displays a new file
	 * dialog on the RepoPageEditor page.
	 *
	 */
	var RepoEditorPage_NewFileDialog$1 = /** @class */ (function (_super) {
	    tslib_1.__extends(RepoEditorPage_NewFileDialog, _super);
	    function RepoEditorPage_NewFileDialog(context, openElement, FS, editor) {
	        var _this = _super.call(this) || this;
	        _this.context = context;
	        _this.openElement = openElement;
	        _this.FS = FS;
	        _this.editor = editor;
	        document.body.appendChild(_this.el);
	        _this.$el = jQuery(_this.el);
	        Eventify(_this.el, {
	            "click": function (evt) {
	                var filename = _this.$.filename.value;
	                if (0 == filename.length) {
	                    EBW$1.Alert("You need to provide a filename.");
	                    return;
	                }
	                if (filename.substr(0, 1) != '/') {
	                    filename = "/" + filename;
	                }
	                _this.FS.FileState(filename)
	                    .then(function (fs) {
	                    if (!(fs == FileState.Absent || fs == FileState.Deleted || fs == FileState.Undefined)) {
	                        EBW$1.Alert("A file named " + filename + " already exists");
	                        return;
	                    }
	                    _this.FS.Write(filename, "")
	                        .then(function (f) {
	                        _this.dialog.Close();
	                        _this.editor.setFile(f);
	                    });
	                });
	            },
	            "change": function (evt) {
	            }
	        });
	        _this.dialog = new FoundationRevealDialog$1(openElement, _this.el);
	        _this.dialog.Events.add(function (act) {
	            switch (act) {
	                case DialogEvents.Opened:
	                    _this.$.filename.value = '';
	                    _this.$.filename.focus();
	                    break;
	                case DialogEvents.Closed:
	                    break;
	            }
	        });
	        return _this;
	    }
	    return RepoEditorPage_NewFileDialog;
	}(RepoEditorPage_NewFileDialog));

	/**
	 * RepoEditorPage_RenameFileDialog displays a Rename file
	 * dialog on the RepoPageEditor page.
	 */
	var RepoEditorPage_RenameFileDialog$1 = /** @class */ (function (_super) {
	    tslib_1.__extends(RepoEditorPage_RenameFileDialog, _super);
	    function RepoEditorPage_RenameFileDialog(context, openElement, editor) {
	        var _this = _super.call(this) || this;
	        _this.context = context;
	        _this.openElement = openElement;
	        _this.editor = editor;
	        Eventify(_this.el, {
	            "click": function (evt) {
	                var toName = _this.$.filename.value;
	                _this.editor.Rename(toName)
	                    .then(function () {
	                    _this.dialog.Close();
	                })
	                    .catch(EBW$1.Error);
	            },
	            "change": function (evt) {
	            }
	        });
	        _this.dialog = new FoundationRevealDialog$1(openElement, _this.el);
	        _this.dialog.Events.add(function (act) {
	            switch (act) {
	                case DialogEvents.Opened:
	                    _this.$.filename.value = _this.editor.File().Name();
	                    _this.$.filename.focus();
	                    _this.$.current_name.innerText = _this.editor.File().Name();
	                    break;
	                case DialogEvents.Closed:
	                    break;
	            }
	        });
	        return _this;
	    }
	    return RepoEditorPage_RenameFileDialog;
	}(RepoEditorPage_RenameFileDialog));

	function SHA1(input) {
	    var sha = new jsSHA("SHA-1", "TEXT");
	    sha.update(input);
	    return sha.getHash("HEX");
	}

	var File = /** @class */ (function () {
	    function File(name, exists, hash, data) {
	        if (hash === void 0) { hash = undefined; }
	        if (data === void 0) { data = undefined; }
	        this.name = name;
	        this.exists = exists;
	        this.hash = hash;
	        this.data = data;
	        this.state = FileState.Undefined;
	    }
	    File.prototype.Serialize = function () {
	        return JSON.stringify(this);
	    };
	    File.Deserialize = function (js) {
	        var o = JSON.parse(js);
	        return new File(o.name, o.exists, o.hash, o.data);
	    };
	    File.FromWireFile = function (w) {
	        return new File(w.Path, w.Exists, w.Hash == "" ? undefined : w.Hash, w.Data == "" ? undefined : w.Data);
	    };
	    File.prototype.Name = function () {
	        return this.name;
	    };
	    Object.defineProperty(File.prototype, "path", {
	        get: function () { return this.name; },
	        enumerable: true,
	        configurable: true
	    });
	    File.prototype.Exists = function () {
	        return Promise.resolve(this.exists);
	    };
	    File.prototype.Data = function () {
	        if (!this.exists) {
	            return Promise.resolve(undefined);
	        }
	        return Promise.resolve(this.data);
	    };
	    File.prototype.DataEvenIfDeleted = function () {
	        return Promise.resolve(this.data == undefined ? '' : this.data);
	    };
	    // It is possible to have the Hash and not the data. One might do this
	    // for the HEAD FS, for eg., since we are only really interested in the
	    // WD files content.
	    File.prototype.Hash = function () {
	        if (undefined == this.hash) {
	            if (undefined == this.data) {
	                return undefined;
	            }
	            this.hash = SHA1(this.data);
	        }
	        return this.hash;
	    };
	    File.prototype.SetState = function (s) {
	        this.state = s;
	    };
	    File.prototype.SetStateCSS = function (el) {
	        if (this.state == undefined || this.state == FileState.Undefined) {
	            debugger;
	        }
	        SetFileStateCSS(el, this.state);
	    };
	    File.prototype.SetData = function (d, hash) {
	        if (hash === void 0) { hash = undefined; }
	        this.data = d;
	        // Recalc hash
	        if (undefined == d) {
	            this.hash = undefined;
	        }
	        else {
	            if (undefined == hash)
	                this.hash = SHA1(this.data);
	            else
	                this.hash = hash;
	        }
	    };
	    File.prototype.SetExists = function (e) {
	        this.exists = e;
	    };
	    File.prototype.IsDeleted = function () {
	        return this.state == FileState.Deleted;
	    };
	    return File;
	}());

	var FSStateAndPath = /** @class */ (function () {
	    function FSStateAndPath(path, state) {
	        this.path = path;
	        this.state = state;
	    }
	    FSStateAndPath.prototype.ShouldSync = function () {
	        return !(this.state == FileState.Absent ||
	            this.state == FileState.Unchanged ||
	            this.state == FileState.Undefined);
	    };
	    return FSStateAndPath;
	}());
	/**
	 * Base class implementation of a File System.
	 */
	var FSImpl = /** @class */ (function () {
	    function FSImpl(parent) {
	        this.parent = parent;
	    }
	    FSImpl.prototype.Move = function (from, to) {
	        var _this = this;
	        return this.Read(to)
	            .then(function (f) {
	            if (from == to) {
	                return Promise.resolve(f);
	            }
	            if (f.exists) {
	                console.log("FOUND " + to + ": ", f);
	                return Promise.reject("The destination file " + to + " already exists.");
	            }
	            return _this.Read(from)
	                .then(function (f) { return f.Data(); })
	                .then(function (raw) { return _this.Write(to, raw); })
	                .then(function (f) {
	                return _this.Remove(from)
	                    .then(function (_) {
	                    return Promise.resolve(f);
	                });
	            });
	        });
	    };
	    FSImpl.prototype.Set = function (f) {
	        var _this = this;
	        return f.Exists()
	            .then(function (exists) {
	            if (exists) {
	                return f.Data()
	                    .then(function (raw) { return _this.Write(f.Name(), raw); });
	            }
	            else {
	                return _this.Remove(f.Name());
	            }
	        });
	    };
	    FSImpl.prototype.Revert = function (path) {
	        var _this = this;
	        if (null == this.Parent()) {
	            return Promise.reject("Cannot revert on a FS without a parent FS");
	        }
	        console.log("FSImpl.Revert : this.Parent().Name() = " + this.Parent().Name());
	        return this.Parent().Read(path)
	            .then(function (f) { return _this.Set(f); });
	    };
	    /**
	     * Parent filesystem, or the parent filesystem with the given
	     * name.
	     */
	    FSImpl.prototype.Parent = function (name) {
	        if (name === void 0) { name = ""; }
	        if (null == this.parent) {
	            return null;
	        }
	        if (("" == name) || (name == this.parent.Name())) {
	            return this.parent;
	        }
	        return this.parent.Parent(name);
	    };
	    /**
	     * setState sets the state of a File and returns a Promise with
	     * the File with its state set.
	     */
	    FSImpl.prototype.setState = function (f) {
	        return this.FileState(f.Name())
	            .then(function (fs) {
	            f.state = fs;
	            return Promise.resolve(f);
	        });
	    };
	    /**
	     * FileState returns the state of a file between this FS and this FS's parent.
	     */
	    FSImpl.prototype.FileState = function (path) {
	        if (!this.Parent()) {
	            return Promise.resolve(FileState.Undefined);
	        }
	        return Promise.all([this.Read(path), this.Parent().Read(path)])
	            .then(function (_a) {
	            var top = _a[0], bottom = _a[1];
	            // console.log(`FileState ${path} : top.hash=${top.hash}, bottom.hash=${bottom.hash}`);
	            var fs = FileState.Unchanged;
	            if (top.exists && !bottom.exists) {
	                fs = FileState.New;
	            }
	            else if ((!top.exists) && bottom.exists) {
	                fs = FileState.Deleted;
	            }
	            else if (!(top.exists || bottom.exists)) {
	                fs = FileState.Absent;
	            }
	            else if (top.Hash() != bottom.Hash()) {
	                fs = FileState.Changed;
	            }
	            return Promise.resolve(fs);
	        });
	    };
	    /**
	     * FileStateAndPath returns the FSStateAndPath object for the
	     * given path. This is useful when working with functional classes.
	     */
	    FSImpl.prototype.FileStateAndPath = function (path) {
	        return this.FileState(path)
	            .then(function (fs) { return Promise.resolve(new FSStateAndPath(path, fs)); });
	    };
	    return FSImpl;
	}());

	/**
	 * The Memory-based filesystem on this browser right now.
	 * Not yet synced to the lower FS. This allows changes on the
	 * browser that don't get stored, since one might wish to undo them,
	 * etc.
	 */
	var MemFS = /** @class */ (function (_super) {
	    tslib_1.__extends(MemFS, _super);
	    function MemFS(key, parent) {
	        var _this = _super.call(this, parent) || this;
	        _this.key = key;
	        _this.cache = new Map();
	        return _this;
	    }
	    MemFS.prototype.getCache = function (path) {
	        if (this.cache.has(path)) {
	            // let f = this.cache.get(path);
	            // return f;
	            return this.cache.get(path);
	        }
	        return undefined;
	    };
	    MemFS.prototype.setCache = function (f) {
	        this.cache.set(f.name, f);
	    };
	    MemFS.prototype.clearCache = function (path) {
	        if (typeof path == 'string') {
	            this.cache.delete(path);
	        }
	        else {
	            this.cache.delete(path.name);
	        }
	    };
	    MemFS.prototype.Name = function () { return "mem"; };
	    MemFS.prototype.Read = function (path) {
	        var _this = this;
	        var f = this.getCache(path);
	        if (undefined != f) {
	            return Promise.resolve(f);
	        }
	        if (null == this.parent) {
	            /* TODO: Should this return a 'FileNotExists' file? */
	            return Promise.resolve(undefined);
	        }
	        return this.parent
	            .Read(path)
	            .then(function (f) {
	            _this.setCache(f);
	            return _this.setState(f);
	        });
	    };
	    MemFS.prototype.Write = function (path, data) {
	        var f = new File(path, true, undefined, data);
	        this.setCache(f);
	        return this.setState(f);
	    };
	    MemFS.prototype.Remove = function (path) {
	        var _this = this;
	        return this.Read(path)
	            .then(function (f) {
	            f.exists = false;
	            _this.setCache(f);
	            return _this.setState(f);
	        });
	    };
	    // Revert(path:string):Promise<File> {
	    // 	// Use the FSImpl implementation of Revert, which will
	    // 	// read from Parent and write to us.
	    // 	return this.super.Revert(path)
	    // 	.then(
	    // 		(f:File)=>{
	    // 			this.setCache(f);
	    // 			return this.setState(f);
	    // 		});
	    // }
	    MemFS.prototype.Sync = function (path) {
	        var _this = this;
	        var f = this.getCache(path);
	        if (undefined == f) {
	            return Promise.reject("Cannot sync file " + path + " that doesn't exist in FileSystem");
	        }
	        if (undefined == this.parent) {
	            return Promise.reject("Cannot sync on a FileSystem that doesn't have a parent");
	        }
	        return f.Exists().then(function (exists) {
	            if (exists) {
	                return f.Data()
	                    .then(function (data) { return _this.parent.Write(path, data); })
	                    .then(function (f) { return _this.setState(f); });
	            }
	            return _this.parent.Remove(path)
	                .then(function (_) {
	                return _this.setState(f);
	            });
	        });
	    };
	    return MemFS;
	}(FSImpl));

	/**
	 * WorkingDirFS connects directly to the Working Directory on the
	 * server and reads/writes files from the git Working Dir. All writes
	 * are written to the WorkingDir and staged.
	 */
	var WorkingDirFS = /** @class */ (function (_super) {
	    tslib_1.__extends(WorkingDirFS, _super);
	    function WorkingDirFS(context, parent) {
	        var _this = _super.call(this, parent) || this;
	        _this.context = context;
	        return _this;
	    }
	    WorkingDirFS.prototype.Name = function () { return "working"; };
	    WorkingDirFS.prototype.Read = function (path) {
	        var _this = this;
	        return this.context.API()
	            .ReadFileData(this.context.RepoOwner, this.context.RepoName, "our-wd", path)
	            .then(function (_a) {
	            var w = _a[0];
	            var f = File.FromWireFile(w);
	            return _this.setState(f);
	        });
	    };
	    WorkingDirFS.prototype.Write = function (path, data) {
	        var _this = this;
	        return this.context.API()
	            .WriteAndStageFile(this.context.RepoOwner, this.context.RepoName, path, data).then(function (_a) {
	            var w = _a[0];
	            return _this.setState(File.FromWireFile(w));
	        });
	    };
	    WorkingDirFS.prototype.Remove = function (path) {
	        var _this = this;
	        return this.context.API()
	            .RemoveAndStageFile(this.context.RepoOwner, this.context.RepoName, path)
	            .then(function () { return _this.setState(new File(path, false)); });
	    };
	    WorkingDirFS.prototype.Sync = function (path) {
	        var _this = this;
	        // Sync'ing a WorkingDir is adding to the Index
	        return this.context.API()
	            .StageFile(this.context.RepoOwner, this.context.RepoName, path)
	            .then(function () { return _this.Read(path); });
	    };
	    WorkingDirFS.prototype.Revert = function (path) {
	        return this.context.API()
	            .RevertFile(this.context.RepoOwner, this.context.RepoName, path)
	            .then(function (_a) {
	            var w = _a[0];
	            return setState(File.FromWireFile(w));
	        });
	    };
	    return WorkingDirFS;
	}(FSImpl));

	/**
	 * NotifyFS is transparent, but notifies listeners of any changes to
	 * a path.
	 */
	var NotifyFS = /** @class */ (function (_super) {
	    tslib_1.__extends(NotifyFS, _super);
	    function NotifyFS(parent) {
	        var _this = _super.call(this, parent) || this;
	        _this.parent = parent;
	        _this.Listeners = new signals.Signal();
	        return _this;
	    }
	    NotifyFS.prototype.notify = function (f) {
	        this.Listeners.dispatch(f);
	        return Promise.resolve(f);
	    };
	    NotifyFS.prototype.Name = function () { return this.parent.Name(); };
	    NotifyFS.prototype.Read = function (path) {
	        return this.parent.Read(path);
	    };
	    NotifyFS.prototype.Write = function (path, data) {
	        var _this = this;
	        return this.parent.Write(path, data)
	            .then(function (f) { return _this.notify(f); });
	    };
	    NotifyFS.prototype.Remove = function (path) {
	        var _this = this;
	        return this.parent.Remove(path)
	            .then(function (f) { return _this.notify(f); });
	    };
	    NotifyFS.prototype.Sync = function (path) {
	        var _this = this;
	        return this.parent.Sync(path)
	            .then(function (f) {
	            return _this.notify(f);
	        });
	    };
	    NotifyFS.prototype.Revert = function (path) {
	        var _this = this;
	        return this.parent.Revert(path)
	            .then(function (f) { return _this.notify(f); });
	    };
	    // Notify is a transparent FS, so the call to parent needs to actually
	    // be the call to its parent's parent
	    NotifyFS.prototype.Parent = function (name) {
	        if (name === void 0) { name = ""; }
	        return this.parent.Parent(name);
	    };
	    return NotifyFS;
	}(FSImpl));

	// ReadCacheFS is a read-only cache between an underlying FS and a session based
	// cache. All Writes, Syncs, etc are passed transparently through. For all intents and
	// purposes - except caching - it is transparent.
	var ReadCacheFS = /** @class */ (function (_super) {
	    tslib_1.__extends(ReadCacheFS, _super);
	    function ReadCacheFS(key, parent) {
	        var _this = _super.call(this, parent) || this;
	        _this.key = key;
	        return _this;
	    }
	    ReadCacheFS.prototype.cacheKey = function (path) {
	        return this.key + ":" + path;
	    };
	    ReadCacheFS.prototype.clearCache = function (path) {
	        sessionStorage.removeItem(this.cacheKey(path));
	    };
	    ReadCacheFS.prototype.setCache = function (f) {
	        var data = f.Serialize();
	        try {
	            if (data.length <= ReadCacheFS.MaxCacheSize) {
	                sessionStorage.setItem(this.cacheKey(f.Name()), data);
	            }
	            else {
	                console.log("ReadCacheFS won't cache " + f.Name() + " : MaxCacheSize " + ReadCacheFS.MaxCacheSize + " < length = " + data.length);
	            }
	        }
	        catch (e) {
	            if ("QuotaExceededError" == e.name) ;
	            else {
	                EBW.Error(err);
	            }
	        }
	        return Promise.resolve(f);
	    };
	    ReadCacheFS.prototype.getCache = function (path) {
	        var js = sessionStorage.getItem(this.cacheKey(path));
	        if (null == js) {
	            return undefined;
	        }
	        return File.Deserialize(js);
	    };
	    ReadCacheFS.prototype.Name = function () { return this.parent.Name(); };
	    ReadCacheFS.prototype.Read = function (path) {
	        var _this = this;
	        // console.log(`ReadCacheFS::Read(${path})`);
	        var f = this.getCache(path);
	        if (undefined != f) {
	            return Promise.resolve(f);
	        }
	        return this.parent.Read(path)
	            .then(function (f) { return _this.setCache(f); });
	    };
	    ReadCacheFS.prototype.Write = function (path, data) {
	        var _this = this;
	        return this.parent.Write(path, data)
	            .then(function (f) { return _this.setCache(f); });
	    };
	    // A transparent FS, so the call to parent needs to actually
	    // be the call to its parent's parent
	    ReadCacheFS.prototype.Parent = function (name) {
	        if (name === void 0) { name = ""; }
	        return this.parent.Parent(name);
	    };
	    ReadCacheFS.prototype.Remove = function (path) {
	        var _this = this;
	        return this.parent.Remove(path)
	            .then(function (f) { return _this.setCache(f); });
	    };
	    ReadCacheFS.prototype.Sync = function (path) {
	        var _this = this;
	        return this.parent.Sync(path)
	            .then(function (f) { return _this.setCache(f); });
	    };
	    ReadCacheFS.prototype.Revert = function (path) {
	        var _this = this;
	        return this.parent.Revert(path)
	            .then(function (f) { return _this.setCache(f); });
	    };
	    ReadCacheFS.MaxCacheSize = 200000;
	    return ReadCacheFS;
	}(FSImpl));

	/// <reference path="Signal.ts" />
	/*
	*	@desc   	An object that represents a binding between a Signal and a listener function.
	*               Released under the MIT license
	*				http://millermedeiros.github.com/js-signals/
	*
	*	@version	1.0 - 7th March 2013
	*
	*	@author 	Richard Davey, TypeScript conversion
	*	@author		Miller Medeiros, JS Signals
	*	@author		Robert Penner, AS Signals
	*
	*	@url		http://www.kiwijs.org
	*
	*/
	var SignalBinding = /** @class */ (function () {
	    /**
	    * Object that represents a binding between a Signal and a listener function.
	    * <br />- <strong>This is an internal constructor and shouldn't be called by regular users.</strong>
	    * <br />- inspired by Joa Ebert AS3 SignalBinding and Robert Penner's Slot classes.
	    * @author Miller Medeiros
	    * @constructor
	    * @internal
	    * @name SignalBinding
	    * @param {Signal} signal Reference to Signal object that listener is currently bound to.
	    * @param {Function} listener Handler function bound to the signal.
	    * @param {boolean} isOnce If binding should be executed just once.
	    * @param {Object} [listenerContext] Context on which listener will be executed (object that should represent the `this` variable inside listener function).
	    * @param {Number} [priority] The priority level of the event listener. (default = 0).
	    */
	    function SignalBinding(signal, listener, isOnce, listenerContext, priority) {
	        if (priority === void 0) { priority = 0; }
	        /**
	        * If binding is active and should be executed.
	        * @type boolean
	        */
	        this.active = true;
	        /**
	        * Default parameters passed to listener during `Signal.dispatch` and `SignalBinding.execute`. (curried parameters)
	        * @type Array|null
	        */
	        this.params = null;
	        this._listener = listener;
	        this._isOnce = isOnce;
	        this.context = listenerContext;
	        this._signal = signal;
	        this.priority = priority || 0;
	    }
	    /**
	    * Call listener passing arbitrary parameters.
	    * <p>If binding was added using `Signal.addOnce()` it will be automatically removed from signal dispatch queue, this method is used internally for the signal dispatch.</p>
	    * @param {Array} [paramsArr] Array of parameters that should be passed to the listener
	    * @return {*} Value returned by the listener.
	    */
	    SignalBinding.prototype.execute = function (paramsArr) {
	        var handlerReturn;
	        var params;
	        if (this.active && !!this._listener) {
	            params = this.params ? this.params.concat(paramsArr) : paramsArr;
	            handlerReturn = this._listener.apply(this.context, params);
	            if (this._isOnce) {
	                this.detach();
	            }
	        }
	        return handlerReturn;
	    };
	    /**
	    * Detach binding from signal.
	    * - alias to: mySignal.remove(myBinding.getListener());
	    * @return {Function|null} Handler function bound to the signal or `null` if binding was previously detached.
	    */
	    SignalBinding.prototype.detach = function () {
	        return this.isBound() ? this._signal.remove(this._listener, this.context) : null;
	    };
	    /**
	    * @return {Boolean} `true` if binding is still bound to the signal and have a listener.
	    */
	    SignalBinding.prototype.isBound = function () {
	        return (!!this._signal && !!this._listener);
	    };
	    /**
	    * @return {boolean} If SignalBinding will only be executed once.
	    */
	    SignalBinding.prototype.isOnce = function () {
	        return this._isOnce;
	    };
	    /**
	    * @return {Function} Handler function bound to the signal.
	    */
	    SignalBinding.prototype.getListener = function () {
	        return this._listener;
	    };
	    /**
	    * @return {Signal} Signal that listener is currently bound to.
	    */
	    SignalBinding.prototype.getSignal = function () {
	        return this._signal;
	    };
	    /**
	    * Delete instance properties
	    * @private
	    */
	    SignalBinding.prototype._destroy = function () {
	        delete this._signal;
	        delete this._listener;
	        delete this.context;
	    };
	    /**
	    * @return {string} String representation of the object.
	    */
	    SignalBinding.prototype.toString = function () {
	        return '[SignalBinding isOnce:' + this._isOnce + ', isBound:' + this.isBound() + ', active:' + this.active + ']';
	    };
	    return SignalBinding;
	}());

	/**
	*	@desc       A TypeScript conversion of JS Signals by Miller Medeiros
	*               Released under the MIT license
	*				http://millermedeiros.github.com/js-signals/
	*
	*	@version	1.0 - 7th March 2013
	*
	*	@author 	Richard Davey, TypeScript conversion
	*	@author		Miller Medeiros, JS Signals
	*	@author		Robert Penner, AS Signals
	*
	*	@url		http://www.photonstorm.com
	*/
	/**
	* Custom event broadcaster
	* <br />- inspired by Robert Penner's AS3 Signals.
	* @name Signal
	* @author Miller Medeiros
	* @constructor
	*/
	var Signal = /** @class */ (function () {
	    function Signal() {
	        /**
	        * @property _bindings
	        * @type Array
	        * @private
	        */
	        this._bindings = [];
	        /**
	        * @property _prevParams
	        * @type Any
	        * @private
	        */
	        this._prevParams = null;
	        /**
	        * If Signal should keep record of previously dispatched parameters and
	        * automatically execute listener during `add()`/`addOnce()` if Signal was
	        * already dispatched before.
	        * @type boolean
	        */
	        this.memorize = false;
	        /**
	        * @type boolean
	        * @private
	        */
	        this._shouldPropagate = true;
	        /**
	        * If Signal is active and should broadcast events.
	        * <p><strong>IMPORTANT:</strong> Setting this property during a dispatch will only affect the next dispatch, if you want to stop the propagation of a signal use `halt()` instead.</p>
	        * @type boolean
	        */
	        this.active = true;
	    }
	    /**
	    * @method validateListener
	    * @param {Any} listener
	    * @param {Any} fnName
	    */
	    Signal.prototype.validateListener = function (listener, fnName) {
	        if (typeof listener !== 'function') {
	            throw new Error('listener is a required param of {fn}() and should be a Function.'.replace('{fn}', fnName));
	        }
	    };
	    /**
	    * @param {Function} listener
	    * @param {boolean} isOnce
	    * @param {Object} [listenerContext]
	    * @param {Number} [priority]
	    * @return {SignalBinding}
	    * @private
	    */
	    Signal.prototype._registerListener = function (listener, isOnce, listenerContext, priority) {
	        var prevIndex = this._indexOfListener(listener, listenerContext);
	        var binding;
	        if (prevIndex !== -1) {
	            binding = this._bindings[prevIndex];
	            if (binding.isOnce() !== isOnce) {
	                throw new Error('You cannot add' + (isOnce ? '' : 'Once') + '() then add' + (!isOnce ? '' : 'Once') + '() the same listener without removing the relationship first.');
	            }
	        }
	        else {
	            binding = new SignalBinding(this, listener, isOnce, listenerContext, priority);
	            this._addBinding(binding);
	        }
	        if (this.memorize && this._prevParams) {
	            binding.execute(this._prevParams);
	        }
	        return binding;
	    };
	    /**
	    * @method _addBinding
	    * @param {SignalBinding} binding
	    * @private
	    */
	    Signal.prototype._addBinding = function (binding) {
	        //simplified insertion sort
	        var n = this._bindings.length;
	        do {
	            --n;
	        } while (this._bindings[n] && binding.priority <= this._bindings[n].priority);
	        this._bindings.splice(n + 1, 0, binding);
	    };
	    /**
	    * @method _indexOfListener
	    * @param {Function} listener
	    * @return {number}
	    * @private
	    */
	    Signal.prototype._indexOfListener = function (listener, context) {
	        var n = this._bindings.length;
	        var cur;
	        while (n--) {
	            cur = this._bindings[n];
	            if (cur.getListener() === listener && cur.context === context) {
	                return n;
	            }
	        }
	        return -1;
	    };
	    /**
	    * Check if listener was attached to Signal.
	    * @param {Function} listener
	    * @param {Object} [context]
	    * @return {boolean} if Signal has the specified listener.
	    */
	    Signal.prototype.has = function (listener, context) {
	        if (context === void 0) { context = null; }
	        return this._indexOfListener(listener, context) !== -1;
	    };
	    /**
	    * Add a listener to the signal.
	    * @param {Function} listener Signal handler function.
	    * @param {Object} [listenerContext] Context on which listener will be executed (object that should represent the `this` variable inside listener function).
	    * @param {Number} [priority] The priority level of the event listener. Listeners with higher priority will be executed before listeners with lower priority. Listeners with same priority level will be executed at the same order as they were added. (default = 0)
	    * @return {SignalBinding} An Object representing the binding between the Signal and listener.
	    */
	    Signal.prototype.add = function (listener, listenerContext, priority) {
	        if (listenerContext === void 0) { listenerContext = null; }
	        if (priority === void 0) { priority = 0; }
	        this.validateListener(listener, 'add');
	        return this._registerListener(listener, false, listenerContext, priority);
	    };
	    /**
	    * Add listener to the signal that should be removed after first execution (will be executed only once).
	    * @param {Function} listener Signal handler function.
	    * @param {Object} [listenerContext] Context on which listener will be executed (object that should represent the `this` variable inside listener function).
	    * @param {Number} [priority] The priority level of the event listener. Listeners with higher priority will be executed before listeners with lower priority. Listeners with same priority level will be executed at the same order as they were added. (default = 0)
	    * @return {SignalBinding} An Object representing the binding between the Signal and listener.
	    */
	    Signal.prototype.addOnce = function (listener, listenerContext, priority) {
	        if (listenerContext === void 0) { listenerContext = null; }
	        if (priority === void 0) { priority = 0; }
	        this.validateListener(listener, 'addOnce');
	        return this._registerListener(listener, true, listenerContext, priority);
	    };
	    /**
	    * Remove a single listener from the dispatch queue.
	    * @param {Function} listener Handler function that should be removed.
	    * @param {Object} [context] Execution context (since you can add the same handler multiple times if executing in a different context).
	    * @return {Function} Listener handler function.
	    */
	    Signal.prototype.remove = function (listener, context) {
	        if (context === void 0) { context = null; }
	        this.validateListener(listener, 'remove');
	        var i = this._indexOfListener(listener, context);
	        if (i !== -1) {
	            this._bindings[i]._destroy(); //no reason to a SignalBinding exist if it isn't attached to a signal
	            this._bindings.splice(i, 1);
	        }
	        return listener;
	    };
	    /**
	    * Remove all listeners from the Signal.
	    */
	    Signal.prototype.removeAll = function () {
	        var n = this._bindings.length;
	        while (n--) {
	            this._bindings[n]._destroy();
	        }
	        this._bindings.length = 0;
	    };
	    /**
	    * @return {number} Number of listeners attached to the Signal.
	    */
	    Signal.prototype.getNumListeners = function () {
	        return this._bindings.length;
	    };
	    /**
	    * Stop propagation of the event, blocking the dispatch to next listeners on the queue.
	    * <p><strong>IMPORTANT:</strong> should be called only during signal dispatch, calling it before/after dispatch won't affect signal broadcast.</p>
	    * @see Signal.prototype.disable
	    */
	    Signal.prototype.halt = function () {
	        this._shouldPropagate = false;
	    };
	    /**
	    * Dispatch/Broadcast Signal to all listeners added to the queue.
	    * @param {...*} [params] Parameters that should be passed to each handler.
	    */
	    Signal.prototype.dispatch = function () {
	        var paramsArr = [];
	        for (var _i = 0; _i < arguments.length; _i++) {
	            paramsArr[_i] = arguments[_i];
	        }
	        if (!this.active) {
	            return;
	        }
	        var n = this._bindings.length;
	        var bindings;
	        if (this.memorize) {
	            this._prevParams = paramsArr;
	        }
	        if (!n) {
	            //should come after memorize
	            return;
	        }
	        bindings = this._bindings.slice(0); //clone array in case add/remove items during dispatch
	        this._shouldPropagate = true; //in case `halt` was called before dispatch or during the previous dispatch.
	        //execute all callbacks until end of the list or until a callback returns `false` or stops propagation
	        //reverse loop since listeners with higher priority will be added at the end of the list
	        do {
	            n--;
	        } while (bindings[n] && this._shouldPropagate && bindings[n].execute(paramsArr) !== false);
	    };
	    /**
	    * Forget memorized arguments.
	    * @see Signal.memorize
	    */
	    Signal.prototype.forget = function () {
	        this._prevParams = null;
	    };
	    /**
	    * Remove all bindings from signal and destroy any reference to external objects (destroy Signal object).
	    * <p><strong>IMPORTANT:</strong> calling any method on the signal instance after calling dispose will throw errors.</p>
	    */
	    Signal.prototype.dispose = function () {
	        this.removeAll();
	        delete this._bindings;
	        delete this._prevParams;
	    };
	    /**
	    * @return {string} String representation of the object.
	    */
	    Signal.prototype.toString = function () {
	        return '[Signal active:' + this.active + ' numListeners:' + this.getNumListeners() + ']';
	    };
	    /**
	    * Signals Version Number
	    * @property VERSION
	    * @type String
	    * @const
	    */
	    Signal.VERSION = '1.0.0';
	    return Signal;
	}());

	var NodeType;
	(function (NodeType) {
	    NodeType[NodeType["FILE"] = 1] = "FILE";
	    NodeType[NodeType["DIR"] = 2] = "DIR";
	})(NodeType || (NodeType = {}));
	// Node is a generic node in a tree. It might be a leaf, it might not.
	var Node = /** @class */ (function () {
	    function Node(parent, name, nodeType, data) {
	        this.parent = parent;
	        this.name = name;
	        this.nodeType = nodeType;
	        this.data = data;
	        this.changed = new Signal();
	        this.removed = new Signal();
	        this.added = new Signal();
	        this.children = new Array();
	    }
	    Node.prototype.depth = function () {
	        if (null == this.parent) {
	            return 0;
	        }
	        return 1 + this.parent.depth();
	    };
	    Node.prototype.canCollapse = function () {
	        return (this.nodeType == NodeType.DIR);
	    };
	    Node.prototype.child = function (name) {
	        for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
	            var c = _a[_i];
	            if (c.name == name) {
	                return c;
	            }
	        }
	        return undefined;
	    };
	    Node.prototype.parents = function () {
	        if (null == this.parent) {
	            // The root Node is a placeholder, and returns as a non-existent node
	            var a_1 = [];
	            return a_1;
	        }
	        var a = this.parent.parents();
	        a.push(this);
	        return a;
	    };
	    Node.prototype.path = function () {
	        return '/' + this.parents().map(function (n) { return n.name; }).join("/");
	    };
	    /**
	     * root returns the root node of the tree in which this node is located
	     */
	    Node.prototype.root = function () {
	        if (this.parent) {
	            return this.parent.root();
	        }
	        return this;
	    };
	    Node.prototype.add = function (n) {
	        // TODO: SORT CHILDREN
	        this.children.push(n);
	        n.parent = this;
	        // TODO: Notify listeners of the new child - NODE_ADDED
	        this.added.dispatch(n);
	    };
	    /**
	     * find returns the Node for the given path from the root of
	     * this Node's filesystem.
	     */
	    Node.prototype.find = function (path) {
	        return this.root().recurse_path(Node.path_array(path), undefined);
	    };
	    Node.prototype.remove = function () {
	        var i = this.parent.children.indexOf(this);
	        if (-1 == i) {
	            console.error("failed to find Node " + this.name + " in list of parent's children");
	            return;
	        }
	        this.parent.children.splice(i, 1);
	        this.removed.dispatch(this);
	    };
	    Node.prototype.change = function () {
	        this.changed.dispatch(this);
	    };
	    Node.prototype.NodeFromPath = function (path) {
	        return this.root().recurse_path(Node.path_array(path), null);
	    };
	    Node.prototype.FindOrCreateFileNode = function (path, data) {
	        if (data === void 0) { data = undefined; }
	        return this.root().recurse_path(Node.path_array(path), function (path, parent) {
	            var nt = NodeType.FILE;
	            if (1 < path.length) {
	                nt = NodeType.DIR;
	            }
	            var n = new Node(parent, path[0], nt, data);
	            parent.add(n); // @TODO : SHOULD REALLY SORT FILES AS THEY ARE ADDED TO THE FileSystem in FileSystem.ts
	            return n;
	        });
	    };
	    Node.prototype.FindFileNode = function (path) {
	        return this.root().recurse_path(Node.path_array(path));
	    };
	    Node.path_array = function (path) {
	        var p = path.split("/");
	        if ("" == p[0]) {
	            p = p.slice(1);
	        }
	        return p;
	    };
	    Node.prototype.recurse_path = function (path, handler) {
	        var c = this.child(path[0]);
	        if (undefined == c && handler) {
	            c = handler(path, this);
	        }
	        if (undefined == c || path.length == 1) {
	            return c;
	        }
	        return c.recurse_path(path.slice(1), handler);
	    };
	    Node.prototype.walkFiles = function (handle) {
	        if (this.nodeType == NodeType.FILE) {
	            handle(this.path());
	        }
	        for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
	            var c = _a[_i];
	            c.walkFiles(handle);
	        }
	    };
	    Node.prototype.files = function () {
	        var a = [];
	        this.walkFiles(function (p) { return a.push(p); });
	        return a;
	    };
	    return Node;
	}());

	// Expand directories that contain changed files
	function expandChangedFilesInTree() {
	    var dirs = document.querySelectorAll('#all-files-editor .node-dir');
	    dirs.forEach(function (dir) {
	        if (dir.querySelector('.change')) {
	            dir.classList.remove('closed');
	        }
	    });
	}
	function addChildNode(parent, el) {
	    if (0 == parent.children.length) {
	        parent.appendChild(el);
	        return;
	    }
	    var thisFilename = el.getAttribute("short-filename");
	    for (var i = 0; i < parent.children.length; i++) {
	        var sibling = parent.children[i];
	        var fn = sibling.getAttribute("short-filename");
	        // console.log(`Comparing ${thisFilename} against ${fn}`);
	        if (fn > thisFilename) {
	            parent.insertBefore(el, sibling);
	            return;
	        }
	    }
	    parent.appendChild(el);
	}
	/**
	 * FileSystemView displays a FileSystem, with each node either a Directory or a
	 * FileView itself.
	 * When a file is clicked, an `ebw-file-clicked` event will be dispatched from the
	 * parent element.
	 */
	var FileSystemView = /** @class */ (function () {
	    function FileSystemView(context, root, parent, ignoreFunction, notifyFS, styler) {
	        this.context = context;
	        this.root = root;
	        this.parent = parent;
	        this.ignoreFunction = ignoreFunction;
	        this.notifyFS = notifyFS;
	        this.styler = styler;
	        this.views = new Map();
	        this.root.added.add(this.nodeAdded, this);
	        if (this.notifyFS) {
	            this.notifyFS.Listeners.add(this.notifyFileChange, this);
	        }
	    }
	    FileSystemView.prototype.nodeAdded = function (n) {
	        var _this = this;
	        new NodeView(this, n, function (el) { return addChildNode(_this.parent, el); }, this.ignoreFunction, this.styler);
	    };
	    FileSystemView.prototype.prepopulate = function (paths) {
	        paths.sort();
	        for (var _i = 0, paths_1 = paths; _i < paths_1.length; _i++) {
	            var p = paths_1[_i];
	            this.root.FindOrCreateFileNode(p);
	        }
	    };
	    FileSystemView.prototype.notifyFileChange = function (f) {
	        var view = this.views[f.path];
	        if (view) {
	            view.notifyFileChange(this.notifyFS, f);
	        }
	    };
	    FileSystemView.prototype.apply = function (path, f) {
	        var v = this.views[path];
	        if (v)
	            f(v);
	    };
	    FileSystemView.prototype.mapView = function (n) {
	        this.views[n.path()] = n;
	    };
	    FileSystemView.prototype.keyForNode = function (n) {
	        return this.context.RepoOwner + ":" + this.context.RepoName + ":" + n.path()
	            + ".fsv.closed";
	    };
	    FileSystemView.prototype.isClosed = function (node) {
	        var v = window.localStorage.getItem(this.keyForNode(node));
	        return null == v;
	    };
	    FileSystemView.prototype.setClosed = function (node, closed) {
	        var key = this.keyForNode(node);
	        if (closed) {
	            window.localStorage.removeItem(key);
	        }
	        else {
	            window.localStorage.setItem(key, "t");
	        }
	    };
	    return FileSystemView;
	}());
	var NodeView = /** @class */ (function (_super) {
	    tslib_1.__extends(NodeView, _super);
	    function NodeView(FSV, node, parent, ignoreFunction, styler) {
	        var _this = _super.call(this) || this;
	        _this.FSV = FSV;
	        _this.node = node;
	        _this.parent = parent;
	        _this.ignoreFunction = ignoreFunction;
	        _this.styler = styler;
	        _this.$.name.innerText = _this.node.name;
	        if (node.canCollapse()) {
	            _this.$.close.addEventListener("click", function (evt) {
	                evt.preventDefault();
	                evt.stopPropagation();
	                var c = _this.$.children;
	                _this.el.classList.toggle("closed");
	                _this.FSV.setClosed(_this.node, _this.el.classList.contains("closed"));
	            });
	            _this.el.classList.add("node-dir");
	        }
	        else {
	            _this.el.classList.add("node-file");
	            _this.el.addEventListener("click", function (evt) {
	                evt.preventDefault();
	                evt.stopPropagation();
	                _this.el.dispatchEvent(new CustomEvent("ebw-file-clicked", {
	                    bubbles: true,
	                    cancelable: true,
	                    detail: _this.path(),
	                }));
	            });
	        }
	        if (FSV.isClosed(node)) {
	            _this.el.classList.add("closed");
	        }
	        // Remove the leading slash for regex text of path
	        var pathForIgnoreTest = _this.node.path().replace('/', '');
	        if (_this.ignoreFunction(pathForIgnoreTest)) {
	            _this.el.classList.add("ignore");
	        }
	        _this.node.added.add(_this.childAdded, _this);
	        _this.el.setAttribute("short-filename", node.name);
	        // this.el.style.marginLeft = (0.4*node.depth())+"em";
	        parent(_this.el);
	        _this.FSV.mapView(_this);
	        if (_this.styler) {
	            _this.styler(_this.node, _this.el);
	        }
	        // Auto expand folders with changes files in diff viewer
	        if (document.getElementById('repo-diff-file-viewer')) {
	            expandChangedFilesInTree();
	        }
	        return _this;
	    }
	    NodeView.prototype.childAdded = function (n) {
	        var _this = this;
	        new NodeView(this.FSV, n, function (el) { return addChildNode(_this.$.children, el); }, this.ignoreFunction, this.styler);
	    };
	    NodeView.prototype.notifyFileChange = function (fs, f) {
	        f.SetStateCSS(this.el);
	    };
	    NodeView.prototype.notifyEditing = function (b) {
	        this.el.classList.remove("editing-in-progress");
	        if (b) {
	            this.el.classList.add("editing-in-progress");
	        }
	    };
	    NodeView.prototype.path = function () {
	        return this.node.path();
	    };
	    return NodeView;
	}(Tree_NodeView));

	// import {Directory} from './Directory';
	/**
	 * FileSystemConnector links a view of the FileSystem as implemented
	 * by a Tree/FileSystemView2 with the RepoFileEditorCM, ensuring that
	 * when a `ebw-file-clicked` event is received from the FileSystemView,
	 * the editor begins editing the file. Likewise, any events it the
	 * FS filesystem will be reported to the FileSystemView.
	 */
	var FileSystemConnector = /** @class */ (function () {
	    function FileSystemConnector(context, parent, editor, FS, ignoreFunction, filesJson, root, filesAndHashes) {
	        var _this = this;
	        this.context = context;
	        this.parent = parent;
	        this.editor = editor;
	        this.FS = FS;
	        this.ignoreFunction = ignoreFunction;
	        this.filesJson = filesJson;
	        this.root = root;
	        this.api = EBW$1.API();
	        this.FS.Listeners.add(this.FSEvent, this);
	        this.View = new FileSystemView(this.context, this.root, parent, this.ignoreFunction, this.FS);
	        parent.addEventListener("ebw-file-clicked", function (evt) {
	            var path = evt.detail;
	            _this.loadingFile = path;
	            _this.FS.Read(path)
	                .then(function (f) {
	                if (_this.loadingFile != f.Name()) {
	                    //console.log(`caught out-of-sync file read for : ${f.Name()}`);
	                    return;
	                }
	                _this.editor.setFile(f);
	            })
	                .catch(EBW$1.Error);
	        });
	        this.View.prepopulate(filesAndHashes.map(function (_a) {
	            var p = _a[0], h = _a[1];
	            return p;
	        }));
	        this.editor.Listeners.add(this.EditorEvent, this);
	    }
	    FileSystemConnector.prototype.EditorEvent = function (evt) {
	        var f = evt.File();
	        if (!f)
	            return;
	        var v = this.root.FindOrCreateFileNode(f.Name());
	        if (!v) {
	            console.error("FileSystemConnector.EditorEvent: Failed to find a NodeView for file ", f.Name());
	            return;
	        }
	        var editing = true;
	        switch (evt.Event()) {
	            case EditorEvents.Saved:
	            case EditorEvents.Changed:
	            case EditorEvents.Loaded:
	                editing = true;
	                break;
	            case EditorEvents.Unloaded:
	                editing = false;
	                break;
	        }
	        this.View.apply(f.Name(), function (v) { return v.notifyEditing(editing); });
	    };
	    FileSystemConnector.prototype.FSEvent = function (f) {
	        if (undefined == f) {
	            debugger;
	        }
	        // console.log(`FileSystemConnector.FSEvent, f=`, f);
	        switch (f.state) {
	            case FileState.New:
	            //	fallthrough
	            case FileState.Unchanged:
	            // fallthrough
	            case FileState.Changed:
	                this.root.FindOrCreateFileNode(f.path);
	                break;
	            case FileState.Deleted:
	                // Nothing to do - deletion is a CSS issue
	                break;
	            case FileState.NotExist:
	                break;
	        }
	    };
	    return FileSystemConnector;
	}());

	/**
	 * RepoEditorPage is the JS controller for the page that allows
	 * editing of a repo.
	 *
	 */
	var RepoEditorPage = /** @class */ (function () {
	    function RepoEditorPage(context, filesListElement, filesJson, proseIgnoreFunction, filesAndHashes) {
	        var _this = this;
	        this.context = context;
	        this.proseIgnoreFunction = proseIgnoreFunction;
	        sessionStorage.clear();
	        // This is my FileSystem stack, which will ensure that edits are stored in-browser,
	        // and that we can cache reads from the WorkingDirectory.
	        var repoKey = ":/" + context.Username + ":" + context.RepoOwner + ":" + context.RepoName + "/";
	        var wdFS = new WorkingDirFS(this.context, null);
	        var readCacheFS = new ReadCacheFS(SHA1("cache" + repoKey), wdFS);
	        var memFS = new MemFS(SHA1("mem" + repoKey), readCacheFS);
	        this.FS = new NotifyFS(memFS);
	        this.Root = new Node(null, "", NodeType.DIR, null);
	        this.editor = undefined;
	        this.editor = new RepoFileEditorCM$1(context.RepoOwner, context.RepoName, document.getElementById('editor'), {
	            Rename: function () {
	                return;
	            }
	        }, this.FS);
	        new FileSystemConnector(this.context, filesListElement, this.editor, this.FS, this.proseIgnoreFunction, filesJson, this.Root, filesAndHashes);
	        new RepoEditorPage_NewFileDialog$1(this.context, document.getElementById('repo-new-file'), this.FS, this.editor);
	        new RepoEditorPage_RenameFileDialog$1(this.context, document.getElementById("editor-rename-button"), this.editor);
	        new ControlTag(document.getElementById("files-show-tag"), function (showing) {
	            // Toggle body class
	            document.body.classList.toggle('editorMaximised');
	            // Set width of nav
	            document.getElementById("repo-editor-files-nav")
	                .style.width = showing ? "20%" : "0px";
	            var newEditorFilesNavClasses = document
	                .getElementById("repo-editor-files-nav").classList;
	            newEditorFilesNavClasses.toggle('files-nav-hidden');
	            // Show/hide container (avoids leaving scrollbar visible)
	            document.getElementById("all-files-editor-container").style.display = showing ? "block" : "none";
	            // Hide repo actions
	            document.getElementById("repo-file-actions")
	                .style.visibility = showing ? "visible" : "hidden";
	            // Move filename to repo flow
	            var filename = document.querySelector(".file-title");
	            var filenameParent = document.querySelector(".repo-flow-repo-name");
	            filenameParent.appendChild(filename);
	            // Remove slashes from start and end of filename
	            var filenameText = filename.querySelector('.bound-filename-text');
	            var newFilenameText = filenameText.innerHTML.replace(/^\/|\/$/g, '');
	            filenameText.innerHTML = newFilenameText;
	            // Hide footer
	            document.getElementById("page-footer")
	                .style.display = showing ? 'flex' : 'none';
	        });
	        document.getElementById("repo-print-printer").addEventListener('click', function (evt) {
	            evt.preventDefault();
	            evt.stopPropagation();
	            EBW$1.Toast("Creating your PDF. We'll open it in a new tab when it's ready.");
	            new PrintListener(_this.context.RepoOwner, _this.context.RepoName, "book", "print");
	        });
	        document.getElementById("repo-print-screen").addEventListener("click", function (evt) {
	            evt.preventDefault();
	            evt.stopPropagation();
	            EBW$1.Toast("Creating your PDF. We'll open it in a new tab when it's ready.");
	            new PrintListener(_this.context.RepoOwner, _this.context.RepoName, "book", "screen");
	        });
	        document.getElementById("repo-jekyll").addEventListener("click", function (evt) {
	            evt.preventDefault();
	            evt.stopPropagation();
	            var l = document.location;
	            var jekyllUrl = l.protocol + "//" + l.host + "/jekyll-restart/" +
	                (_this.context.RepoOwner + "/" + _this.context.RepoName + "/");
	            console.log("URL = " + jekyllUrl);
	            window.open(jekyllUrl, _this.context.RepoOwner + "-" + _this.context.RepoName + "-jekyll");
	        });
	        /**
	         * Catch any attempt to leave RepoEditorPage and
	         * check that the user has saved any changes.
	         */
	        window.addEventListener("beforeunload", function (evt) {
	            evt.returnValue = "Any unsaved changes will be lost. Continue?";
	        });
	        document.getElementById("repo-save-all").addEventListener("click", function (evt) {
	            evt.preventDefault();
	            evt.stopPropagation();
	            var rs = document.getElementById("repo-save-all");
	            rs.classList.add("active");
	            _this.editor.saveEditorFile(false);
	            _this.SyncFiles().then(function (_) { return rs.classList.remove("active"); });
	        });
	    }
	    RepoEditorPage.prototype.AreFilesSynced = function () {
	        var _this = this;
	        Promise.all(this.Root.files().map(function (p) { return _this.FS.FileStateAndPath(p); }))
	            .then(function (states) {
	            states = states.filter(function (fs) {
	                return fs.ShouldSync();
	            });
	            return new Promise(0 == states.length);
	        });
	    };
	    RepoEditorPage.prototype.SyncFiles = function () {
	        var _this = this;
	        return Promise.all(this.Root.files().map(function (p) { return _this.FS.FileStateAndPath(p); }))
	            .then(function (states) {
	            var shouldSync = states.filter(function (fs) { return fs.ShouldSync(); });
	            return Promise.all(shouldSync.map(function (fs) {
	                _this.FS.Sync(fs.path).then(function (_) {
	                    EBW$1.Toast(fs.path + " saved.");
	                    return Promise.resolve(true);
	                });
	            }));
	        });
	    };
	    return RepoEditorPage;
	}());
	window.RepoEditorPage = RepoEditorPage;

	var FileStatus = /** @class */ (function () {
	    function FileStatus(status) {
	        this.status = status;
	    }
	    FileStatus.prototype.Status = function () {
	        if (this.status) {
	            return this.status;
	        }
	        return 'undefined';
	    };
	    FileStatus.prototype.SetStatus = function (s) {
	        this.status = s;
	    };
	    return FileStatus;
	}());

	var FileContent = /** @class */ (function () {
	    function FileContent(exists, raw) {
	        this.Exists = exists;
	        this.Raw = raw ? raw : "";
	    }
	    return FileContent;
	}());
	var FileEvent;
	(function (FileEvent) {
	    FileEvent[FileEvent["WorkingChanged"] = 0] = "WorkingChanged";
	    FileEvent[FileEvent["TheirChanged"] = 1] = "TheirChanged";
	    FileEvent[FileEvent["StatusChanged"] = 2] = "StatusChanged";
	})(FileEvent || (FileEvent = {}));
	// File models a single conflicted file in the repo.
	// All communication with the conflicted file occurs through this single
	// class, which will coordinate any other internal-classes that it might need,
	// like the file status.
	var File$1 = /** @class */ (function () {
	    function File(context, path, status) {
	        this.context = context;
	        this.path = path;
	        this.status = new FileStatus(status);
	        this.Listen = new signals.Signal();
	        this.ListenRPC = new signals.Signal();
	        this.cache = new Map();
	    }
	    File.prototype.Status = function () {
	        if (this.status) {
	            return this.status.Status();
	        }
	        return 'undefined';
	    };
	    File.prototype.SetStatus = function (source, status) {
	        this.status.SetStatus(status);
	        this.Listen.dispatch(source, FileEvent.StatusChanged, status);
	    };
	    File.prototype.Path = function () {
	        return this.path;
	    };
	    /* THE FOLLOWING METHODS HANDLE CONTENT FOR THE FILE */
	    File.prototype.ClearCache = function () {
	        this.cache.clear();
	    };
	    File.prototype.FetchContent = function (source) {
	        var _this = this;
	        if (this.cache.has("working")) {
	            return Promise.resolve();
	        }
	        this.ListenRPC.dispatch(source, true, "FetchContent");
	        return this.context.API()
	            .MergedFileCat(this.context.RepoOwner, this.context.RepoName, this.path)
	            .then(function (_a) {
	            var workingExists = _a[0], working = _a[1], theirExists = _a[2], their = _a[3], gitMerge = _a[4];
	            var workingFile = new FileContent(workingExists, working);
	            var theirFile = new FileContent(theirExists, their);
	            var gitFile = new FileContent(true, gitMerge);
	            _this.cache.set("working", workingFile);
	            _this.cache.set("their", theirFile);
	            _this.cache.set("git", gitFile);
	            _this.ListenRPC.dispatch(source, false, "FetchContent");
	            _this.Listen.dispatch(source, FileEvent.WorkingChanged, workingFile);
	            _this.Listen.dispatch(source, FileEvent.TheirChanged, theirFile);
	            return Promise.resolve();
	        });
	    };
	    File.prototype.SetWorkingExists = function (b) {
	        this.WorkingFile().Exists = true;
	    };
	    File.prototype.SetTheirExists = function (b) {
	        this.TheirFile().Exists = true;
	    };
	    // FetchGit fetches the git merged content for the file
	    File.prototype.FetchGit = function (source) {
	        var _this = this;
	        if (this.cache.has("git")) {
	            return Promise.resolve();
	        }
	        this.ListenRPC.dispatch(source, true, "FetchGit");
	        return this.context.API()
	            .MergedFileGit(this.context.RepoOwner, this.context.RepoName, this.path)
	            .then(function (_a) {
	            var automerged = _a[0], text = _a[1];
	            var gitFile = new FileContent(true, text);
	            _this.cache.set("git", gitFile);
	            _this.ListenRPC.dispatch(source, false, "FetchGit");
	            // TODO: Should it be WorkingChanged that we're sending?
	            _this.Listen.dispatch(source, FileEvent.WorkingChanged, gitFile);
	            return Promise.resolve();
	        });
	    };
	    File.prototype.RevertOur = function (source) {
	        var _this = this;
	        this.ListenRPC.dispatch(source, true, "RevertOur");
	        return this.mergeFileOriginal("our")
	            .then(function (fc) {
	            _this.cache.set("working", fc);
	            _this.ListenRPC.dispatch(source, false, "RevertOur");
	            _this.Listen.dispatch(source, FileEvent.WorkingChanged, fc);
	            return Promise.resolve(fc);
	        });
	    };
	    File.prototype.RevertOurToTheir = function (source) {
	        var _this = this;
	        this.ListenRPC.dispatch(source, true, "RevertOurToTheir");
	        return this.mergeFileOriginal("their")
	            .then(function (fc) {
	            _this.cache.set("working", fc);
	            _this.ListenRPC.dispatch(source, false, "RevertOur");
	            _this.Listen.dispatch(source, FileEvent.WorkingChanged, fc);
	            return Promise.resolve(fc);
	        });
	    };
	    File.prototype.RevertOurToGit = function (source) {
	        var _this = this;
	        this.ListenRPC.dispatch(source, true, "RevertOurToGit");
	        return this.mergeFileOriginal("git")
	            .then(function (fc) {
	            _this.cache.set("working", fc);
	            _this.ListenRPC.dispatch(source, false, "RevertOurToGit");
	            _this.Listen.dispatch(source, FileEvent.WorkingChanged, fc);
	            return Promise.resolve(fc);
	        });
	    };
	    File.prototype.RevertTheir = function (source) {
	        var _this = this;
	        this.ListenRPC.dispatch(source, true, "RevertTheir");
	        return this.mergeFileOriginal("their")
	            .then(function (fc) {
	            _this.cache.set("their", fc);
	            _this.ListenRPC.dispatch(source, false, "RevertTheir");
	            _this.Listen.dispatch(source, FileEvent.TheirChanged, fc);
	            return Promise.resolve(fc);
	        });
	    };
	    File.prototype.mergeFileOriginal = function (v) {
	        return this.context.API()
	            .MergeFileOriginal(this.context.RepoOwner, this.context.RepoName, this.path, v)
	            .then(function (_a) {
	            var exists = _a[0], raw = _a[1];
	            return Promise.resolve(new FileContent(exists, raw));
	        });
	    };
	    File.prototype.getCachedContent = function (key) {
	        return this.cache.get(key);
	    };
	    File.prototype.setCachedContent = function (key, value) {
	        this.cache.set(key, value);
	    };
	    File.prototype.TheirFile = function () {
	        return this.cache.get("their");
	    };
	    File.prototype.WorkingFile = function () {
	        return this.cache.get("working");
	    };
	    File.prototype.RemoveWorkingFile = function (source) {
	        var fc = new FileContent(false, "");
	        this.cache.set("working", fc);
	        this.Listen.dispatch(source, FileEvent.WorkingChanged, fc);
	        // Don't need to delete on server as this will happen on file save
	    };
	    File.prototype.RemoveTheirFile = function (source) {
	        var fc = new FileContent(false, "");
	        this.cache.set("their", new FileContent(false, ""));
	        this.Listen.dispatch(source, FileEvent.TheirChanged, fc);
	        // Don't need to delete on server as this will happen on file save
	    };
	    File.prototype.SetWorkingContent = function (source, content) {
	        var fc = new FileContent(content != undefined, content);
	        this.cache.set("working", fc);
	        this.Listen.dispatch(source, FileEvent.WorkingChanged, fc);
	    };
	    File.prototype.SetTheirContent = function (source, content) {
	        var fc = new FileContent(content != undefined, content);
	        this.cache.set("their", fc);
	        this.Listen.dispatch(source, FileEvent.TheirChanged, fc);
	    };
	    File.prototype.Save = function () {
	        var _this = this;
	        var working = this.cache.get("working");
	        var their = this.cache.get("their");
	        this.ListenRPC.dispatch(this, true, "Save");
	        return this.context.API()
	            .SaveMergingFile(this.context.RepoOwner, this.context.RepoName, this.Path(), working.Exists, working.Raw, their.Exists, their.Raw)
	            .then(function (_a) {
	            var status = _a[0];
	            _this.ListenRPC.dispatch(_this, false, "Save");
	            _this.SetStatus(undefined, status);
	            return Promise.resolve();
	        });
	    };
	    File.prototype.Stage = function (source) {
	        var _this = this;
	        this.ListenRPC.dispatch(this, true, "Stage");
	        return this.context.API()
	            .StageFileAndReturnMergingState(this.context.RepoOwner, this.context.RepoName, this.Path()).then(function (_a) {
	            var status = _a[0];
	            _this.ListenRPC.dispatch(_this, false, "Stage");
	            _this.SetStatus(source, status);
	            return Promise.resolve();
	        });
	    };
	    return File;
	}());

	var FileListEvent;
	(function (FileListEvent) {
	    FileListEvent[FileListEvent["FileNew"] = 0] = "FileNew";
	    FileListEvent[FileListEvent["FileChanged"] = 1] = "FileChanged";
	})(FileListEvent || (FileListEvent = {}));
	var FileList = /** @class */ (function () {
	    function FileList(context) {
	        this.context = context;
	        this.files = new Array();
	        this.Listen = new signals.Signal();
	    }
	    FileList.prototype.load = function (js) {
	        // I expect js to be an array of {Path:string, Status:string}
	        for (var _i = 0, js_1 = js; _i < js_1.length; _i++) {
	            var j = js_1[_i];
	            var f = new File$1(this.context, j.Path, j.Status);
	            this.files.push(f);
	            this.Listen.dispatch(FileListEvent.FileNew, f);
	        }
	    };
	    return FileList;
	}());

	var FileDisplayEvent;
	(function (FileDisplayEvent) {
	    FileDisplayEvent[FileDisplayEvent["FileClick"] = 0] = "FileClick";
	})(FileDisplayEvent || (FileDisplayEvent = {}));
	var FileDisplay = /** @class */ (function (_super) {
	    tslib_1.__extends(FileDisplay, _super);
	    function FileDisplay(context, parent, file, mergingInfo) {
	        var _this = _super.call(this) || this;
	        _this.context = context;
	        _this.file = file;
	        _this.mergingInfo = mergingInfo;
	        _this.Listen = new signals.Signal();
	        _this.$.path.innerText = file.Path();
	        _this.fileEvent(undefined, FileEvent.StatusChanged, undefined);
	        _this.el.addEventListener("click", function (evt) {
	            evt.preventDefault();
	            evt.stopPropagation();
	            _this.dispatchEvent("file-click");
	            _this.Listen.dispatch(FileDisplayEvent.FileClick, _this.file);
	        });
	        _this.file.Listen.add(_this.fileEvent, _this);
	        _this.file.ListenRPC.add(_this.rpcEvent, _this);
	        parent.appendChild(_this.el);
	        return _this;
	    }
	    FileDisplay.prototype.dispatchEvent = function (name) {
	        var d = { bubbles: true, detail: { file: this.file } };
	        this.el.dispatchEvent(new CustomEvent(name, d));
	    };
	    FileDisplay.prototype.fileEvent = function (source, event, data) {
	        switch (event) {
	            case FileEvent.StatusChanged:
	                this.$.status.innerText = this.file.Status();
	                this.el.classList.remove("status-new", "status-modified", "status-resolved", "status-deleted", "status-conflict", "status-error");
	                this.el.classList.add("status-" + this.file.Status());
	                break;
	        }
	    };
	    FileDisplay.prototype.rpcEvent = function (source, inProgress, method) {
	        console.log("RPC Event for " + this.file.Path() + " inProgress = " + inProgress + ", method = " + method + " status = " + this.file.Status());
	        var cl = this.el.classList;
	        if (inProgress) {
	            cl.add("rpc");
	        }
	        else {
	            cl.remove("rpc");
	        }
	    };
	    return FileDisplay;
	}(conflict_FileDisplay));

	var FileListDisplayEvent;
	(function (FileListDisplayEvent) {
	    FileListDisplayEvent[FileListDisplayEvent["FileClick"] = 0] = "FileClick";
	})(FileListDisplayEvent || (FileListDisplayEvent = {}));
	var FileListDisplay = /** @class */ (function (_super) {
	    tslib_1.__extends(FileListDisplay, _super);
	    function FileListDisplay(context, parent, fileList, mergingInfo) {
	        var _this = _super.call(this) || this;
	        _this.context = context;
	        _this.parent = parent;
	        _this.mergingInfo = mergingInfo;
	        _this.Listen = new signals.Signal();
	        fileList.Listen.add(_this.fileListEvent, _this);
	        _this.parent.appendChild(_this.el);
	        return _this;
	    }
	    FileListDisplay.prototype.fileListEvent = function (e, f) {
	        switch (e) {
	            case FileListEvent.FileNew:
	                var fd = new FileDisplay(this.context, this.el, f, this.mergingInfo);
	                fd.Listen.add(this.fileDisplayEvent, this);
	                break;
	        }
	    };
	    FileListDisplay.prototype.fileDisplayEvent = function (evt, f) {
	        switch (evt) {
	            case FileDisplayEvent.FileClick:
	                this.Listen.dispatch(FileListDisplayEvent, f);
	                break;
	        }
	    };
	    return FileListDisplay;
	}(conflict_FileListDisplay));

	var MergeEditorAction;
	(function (MergeEditorAction) {
	    MergeEditorAction[MergeEditorAction["Save"] = 0] = "Save";
	    MergeEditorAction[MergeEditorAction["Resolve"] = 1] = "Resolve";
	    MergeEditorAction[MergeEditorAction["Delete"] = 2] = "Delete";
	    MergeEditorAction[MergeEditorAction["RevertOur"] = 3] = "RevertOur";
	    MergeEditorAction[MergeEditorAction["RevertTheir"] = 4] = "RevertTheir";
	    MergeEditorAction[MergeEditorAction["RevertGit"] = 5] = "RevertGit";
	    MergeEditorAction[MergeEditorAction["CopyWorking"] = 6] = "CopyWorking";
	    MergeEditorAction[MergeEditorAction["CopyTheir"] = 7] = "CopyTheir";
	})(MergeEditorAction || (MergeEditorAction = {}));
	// MergeEditorControlBar handles the wiring between the editor controls
	// and any listeners interested in these controls
	var MergeEditorControlBar = /** @class */ (function () {
	    function MergeEditorControlBar() {
	        var _this = this;
	        this.Listen = new signals.Signal();
	        this.DeleteButton = this.get("delete");
	        this.SaveButton = this.get("save");
	        this.RevertOurButton = this.get("revert-our");
	        this.RevertTheirButton = this.get("revert-their");
	        this.CopyWorkingButton = this.get("copy-working");
	        this.CopyTheirButton = this.get("copy-their");
	        this.RevertSingleOurButton = this.get("single-revert-our");
	        this.RevertSingleTheirButton = this.get("single-revert-their");
	        this.RevertSingleGitButton = this.get("single-revert-git");
	        this.buttons = new Array();
	        var ln = function (key, act) {
	            var el = _this.get(key);
	            if (el) {
	                el.addEventListener("click", function (evt) {
	                    evt.preventDefault();
	                    evt.stopPropagation();
	                    _this.Listen.dispatch(act);
	                });
	                _this.buttons.push(el);
	            }
	            else {
	                console.error("Failed to find #" + key);
	            }
	        };
	        ln("revert-our", MergeEditorAction.RevertOur);
	        ln("revert-their", MergeEditorAction.RevertTheir);
	        // ln(`revert-git`, MergeEditorAction.RevertGit);
	        ln("copy-working", MergeEditorAction.CopyWorking);
	        ln("copy-their", MergeEditorAction.CopyTheir);
	        ln("save", MergeEditorAction.Save);
	        ln("delete", MergeEditorAction.Delete);
	        ln("resolve", MergeEditorAction.Resolve);
	        ln("single-revert-our", MergeEditorAction.RevertOur);
	        ln("single-revert-their", MergeEditorAction.RevertTheir);
	        ln("single-revert-git", MergeEditorAction.RevertGit);
	        this.imageEditing = false;
	    }
	    MergeEditorControlBar.prototype.get = function (key) {
	        return document.getElementById("merge-editor-control-" + key);
	    };
	    MergeEditorControlBar.prototype.disable = function (el) {
	        this.enable(el, false);
	    };
	    MergeEditorControlBar.prototype.enable = function (el, e) {
	        if (e === void 0) { e = true; }
	        if (e) {
	            el.removeAttribute("disabled");
	        }
	        else {
	            el.setAttribute("disabled", "disabled");
	        }
	    };
	    MergeEditorControlBar.prototype.setImageEditing = function (b) {
	        var sel = document.querySelectorAll(".hide-for-image");
	        for (var i = 0; i < sel.length; i++) {
	            var el = sel.item(i);
	            if (b) {
	                el.setAttribute('hold-display', el.style.display);
	                el.style.display = 'none';
	            }
	            else {
	                el.style.display = el.getAttribute('hold-display');
	            }
	        }
	        this.imageEditing = b;
	    };
	    MergeEditorControlBar.prototype.SetFile = function (f) {
	        if (this.file) {
	            this.file.Listen.remove(this.fileEvent, this);
	        }
	        this.file = f;
	        this.file.Listen.add(this.fileEvent, this);
	    };
	    MergeEditorControlBar.prototype.fileEvent = function (source, e) {
	        for (var _i = 0, _a = this.buttons; _i < _a.length; _i++) {
	            var el = _a[_i];
	            this.enable(el, undefined != this.file);
	        }
	        if (!this.file) {
	            return;
	        }
	        var f = this.file;
	        if (!this.imageEditing) {
	            if (f.WorkingFile().Exists || f.TheirFile().Exists) {
	                // One or the other exists
	                this.DeleteButton.removeAttribute("disabled");
	            }
	            else {
	                this.DeleteButton.setAttribute("disabled", "disabled");
	            }
	        }
	    };
	    return MergeEditorControlBar;
	}());

	var VERSION_OUR = "our-head";
	var VERSION_THEIR = "their-head";
	var MergeImageEditorView = /** @class */ (function () {
	    function MergeImageEditorView(context, parent, path, version, selected) {
	        var _this = this;
	        this.context = context;
	        this.path = path;
	        this.version = version;
	        this.selected = selected;
	        this.img = document.createElement('img');
	        this.img.classList.add("merge-image");
	        this.img.classList.add(version);
	        if (this.selected) {
	            this.img.classList.add('selected');
	        }
	        this.img.src = "/www-version/" + version + "/" + this.context.RepoOwner + "/" + this.context.RepoName + "/" + path;
	        this.img.addEventListener('click', function (evt) {
	            evt.preventDefault();
	            evt.stopPropagation();
	            if (_this.selected) {
	                return;
	            }
	            _this.img.dispatchEvent(new CustomEvent("ImageSelected", { bubbles: true, cancelable: true, detail: {
	                    Path: _this.path,
	                    Version: _this.version
	                }
	            }));
	        });
	        parent.appendChild(this.img);
	    }
	    MergeImageEditorView.prototype.select = function (s) {
	        if (s == this.selected) {
	            return;
	        }
	        if (s) {
	            this.img.classList.add('selected');
	        }
	        else {
	            this.img.classList.remove('selected');
	        }
	        this.selected = s;
	    };
	    return MergeImageEditorView;
	}());
	/**
	 * MergeImageEditor displays two images - ours and theirs - to the user, allowing them to select
	 * the one they wish to keep as the merge result.
	 */
	var MergeImageEditor = /** @class */ (function (_super) {
	    tslib_1.__extends(MergeImageEditor, _super);
	    function MergeImageEditor(context, parent, path) {
	        var _this = _super.call(this) || this;
	        _this.context = context;
	        EBW$1.API().IsOurHeadInWd(context.RepoOwner, context.RepoName, path)
	            .then(function (args) {
	            var oursInWd = args[0];
	            _this.ours = new MergeImageEditorView(context, _this.$.ours, path, VERSION_OUR, oursInWd);
	            _this.theirs = new MergeImageEditorView(context, _this.$.theirs, path, VERSION_THEIR, !oursInWd);
	            _this.apiInFlight = false;
	            _this.el.addEventListener("ImageSelected", function (evt) {
	                if (_this.apiInFlight)
	                    return; // can't have two api calls in flight at the same time
	                var api = EBW$1.API();
	                var p;
	                var ourVersion = evt.detail.Version == VERSION_OUR;
	                _this.apiInFlight = true;
	                if (ourVersion) {
	                    p = api.SaveOurHeadToWd(context.RepoOwner, context.RepoName, path);
	                }
	                else {
	                    p = api.SaveTheirHeadToWd(context.RepoOwner, context.RepoName, path);
	                }
	                p.then(function () {
	                    var ours = evt.detail.V;
	                    _this.ours.select(ourVersion);
	                    _this.theirs.select(!ourVersion);
	                    _this.apiInFlight = false;
	                })
	                    .catch(function (err) {
	                    EBW$1.Error(err);
	                    console.error(err);
	                    _this.apiInFlight = false;
	                });
	            });
	        })
	            .catch(function (err) {
	            EBW$1.Error(err);
	            console.error(err);
	        });
	        parent.appendChild(_this.el);
	        return _this;
	    }
	    return MergeImageEditor;
	}(conflict_MergeImageEditor));

	// MergeEditor controls a Mergely class
	var MergeEditor$1 = /** @class */ (function () {
	    function MergeEditor(context, parent) {
	        this.context = context;
	        this.parent = parent;
	        this.editLeft = true;
	        this.editBoth = true;
	        this.Listen = new signals.Signal();
	        this.controls = new MergeEditorControlBar();
	        this.controls.Listen.add(this.controlAction, this);
	    }
	    // WorkingSide returns a string describing the side on which the
	    // final version will be displayed.
	    MergeEditor.prototype.WorkingSide = function () {
	        return this.editLeft ? "left" : "right";
	    };
	    // TheirSide returns a string describing the side on which
	    // the submitted changes will be displayed.
	    MergeEditor.prototype.TheirSide = function () {
	        return this.editLeft ? "right" : "left";
	    };
	    MergeEditor.prototype.controlAction = function (act) {
	        var _this = this;
	        switch (act) {
	            case MergeEditorAction.Save:
	                this.SaveFile()
	                    .catch(EBW$1.Error);
	                break;
	            case MergeEditorAction.Delete:
	                break;
	            case MergeEditorAction.Resolve:
	                this.SaveFile()
	                    .then(function () {
	                    // undefined so we receive notifications
	                    return _this.file.Stage(undefined);
	                })
	                    .then(function () {
	                    EBW$1.Toast("Resolved changes on " + _this.file.Path());
	                })
	                    .catch(EBW$1.Error);
	                break;
	            case MergeEditorAction.RevertOur:
	                this.RevertOur();
	                break;
	            case MergeEditorAction.RevertTheir:
	                this.RevertTheir();
	                break;
	            case MergeEditorAction.CopyWorking:
	                this.CopyWorking();
	                break;
	            case MergeEditorAction.CopyTheir:
	                this.CopyTheir();
	                break;
	            case MergeEditorAction.RevertGit:
	        }
	    };
	    MergeEditor.prototype.setWorkingText = function (t) {
	        if (this.editLeft) {
	            this.setLHS(t);
	        }
	        else {
	            this.setRHS(t);
	        }
	    };
	    MergeEditor.prototype.setTheirText = function (t) {
	        if (this.editLeft) {
	            this.setRHS(t);
	        }
	        else {
	            this.setLHS(t);
	        }
	    };
	    MergeEditor.prototype.getWorkingText = function () {
	        if (this.editLeft) {
	            return this.getLHS();
	        }
	        return this.getRHS();
	    };
	    MergeEditor.prototype.getTheirText = function () {
	        if (this.editLeft) {
	            return this.getRHS();
	        }
	        return this.getLHS();
	    };
	    MergeEditor.prototype.getWorkingContent = function () {
	        return new FileContent(this.isWorkingDeleted(), this.getWorkingText());
	    };
	    MergeEditor.prototype.getTheirContent = function () {
	        return new FileContent(this.isTheirDeleted(), this.getTheirText());
	    };
	    MergeEditor.prototype.CopyTheir = function () {
	        // We leave source undefined, so that our editor will update
	        // when the change arrives		
	        this.file.SetWorkingContent(undefined, this.isTheirDeleted() ? undefined : this.getTheirText());
	    };
	    MergeEditor.prototype.CopyWorking = function () {
	        // We leave source undefined, so that our editor will update
	        // when the change arrives
	        this.file.SetTheirContent(undefined, this.isWorkingDeleted() ? undefined : this.getWorkingText());
	    };
	    MergeEditor.prototype.RevertOur = function () {
	        // Leave source undefined so that our editor updates when
	        // changes arrive.
	        this.file.RevertOur(undefined)
	            .catch(EBW$1.Error);
	    };
	    MergeEditor.prototype.RevertTheir = function () {
	        // Leave source undefined so that our editor updates when
	        // changes arrive.	
	        this.file.RevertTheir(undefined)
	            .catch(EBW$1.Error);
	    };
	    MergeEditor.prototype.isWorkingDeleted = function () {
	        return !this.file.WorkingFile().Exists;
	    };
	    MergeEditor.prototype.isTheirDeleted = function () {
	        return !this.file.TheirFile().Exists;
	    };
	    MergeEditor.prototype.setText = function (s) {
	        if (this.editLeft) {
	            this.setLHS(s);
	        }
	        else {
	            this.setRHS(s);
	        }
	    };
	    MergeEditor.prototype.getLeftCM = function () {
	        return jQuery(this.mergelyDiv).mergely('cm', 'lhs');
	    };
	    MergeEditor.prototype.getRightCM = function () {
	        return jQuery(this.mergelyDiv).mergely('cm', 'rhs');
	    };
	    MergeEditor.prototype.getLHS = function () {
	        return this.getLeftCM().getDoc().getValue();
	    };
	    MergeEditor.prototype.getRHS = function () {
	        return this.getRightCM().getDoc().getValue();
	    };
	    MergeEditor.prototype.setLHS = function (s) {
	        if (!s)
	            s = "";
	        this.getLeftCM().getDoc().setValue(s);
	    };
	    MergeEditor.prototype.setRHS = function (s) {
	        if (!s)
	            s = "";
	        this.getRightCM().getDoc().setValue(s);
	    };
	    MergeEditor.prototype.SaveFile = function () {
	        if (this.mergeImageEditor != null) {
	            // SaveFile returns automatically if we're resolving images
	            return Promise.resolve("");
	        }
	        if (this.file) {
	            var f_1 = this.file;
	            var w = this.getWorkingText();
	            // We pass ourselves as the source, so that we don't update
	            // our editor when the change event arrives
	            this.file.SetWorkingContent(this, this.isWorkingDeleted() ? undefined : this.getWorkingText());
	            this.file.SetTheirContent(this, this.isTheirDeleted() ? undefined : this.getTheirText());
	            return this.file.Save()
	                .then(function () {
	                EBW$1.Toast("Saved " + f_1.Path());
	                return Promise.resolve("");
	            });
	        }
	        return Promise.reject("No file to save");
	    };
	    MergeEditor.prototype.FileEventListener = function (source, e, fc) {
	        // If we were ourselves the source of the event, we ignore it.
	        if (source == this) {
	            return;
	        }
	        switch (e) {
	            case FileEvent.WorkingChanged:
	                this.setWorkingText(fc.Raw);
	                break;
	            case FileEvent.TheirChanged:
	                this.setTheirText(fc.Raw);
	                break;
	            case FileEvent.StatusChanged:
	                break;
	        }
	    };
	    // Merge starts merging a file.
	    MergeEditor.prototype.Merge = function (file) {
	        var _this = this;
	        // console.log(`Merge: ${file.Path()}`);
	        if (this.file && this.file.Path() == file.Path()) {
	            return; // Nothing to do if we're selecting the same file
	        }
	        // Save any file we're currently editing
	        if (this.file) {
	            if (null == this.mergeImageEditor) {
	                this.SaveFile();
	            }
	            this.file.Listen.remove(this.FileEventListener, this);
	        }
	        // Controls must receive update before we do.
	        // TODO : Actually, the controls should listen to US, not to the
	        // file, and we should have an 'EditorStateModel'... something for next version ;)
	        this.controls.SetFile(file);
	        if (ImageIdentify.isImage(file.Path())) {
	            this.parent.textContent = "";
	            this.mergeImageEditor = new MergeImageEditor(this.context, this.parent, file.Path());
	            this.file = file;
	            this.file.Listen.add(this.FileEventListener, this);
	            console.log("created new MergeImageEditor with parent ", this.parent);
	            this.controls.setImageEditing(true);
	            return;
	        }
	        this.controls.setImageEditing(false);
	        this.mergeImageEditor = null;
	        // VERY importantly, we don't listen to the file 
	        // until after we've concluded the FetchContent, because
	        // we won't have an editor to populate when FetchContent
	        // sends its signals that the content has changed.
	        // However, because we configure ourselves as the source,
	        // if we were listening, it shouldn't be a problem...
	        var p = file.FetchContent(this)
	            .then(function () {
	            return Promise.all([file.WorkingFile(), file.TheirFile()]);
	        })
	            .then(function (args) {
	            var _a = [args[0], args[1]], working = _a[0], their = _a[1];
	            _this.file = file;
	            _this.file.Listen.add(_this.FileEventListener, _this);
	            var lhsText, rhsText;
	            if (_this.editLeft) {
	                lhsText = working.Raw;
	                rhsText = their.Raw;
	            }
	            else {
	                lhsText = their.Raw;
	                rhsText = working.Raw;
	            }
	            // Create a new Mergely Editor for each file
	            _this.parent.textContent = "";
	            _this.mergelyDiv = document.createElement("div");
	            _this.parent.appendChild(_this.mergelyDiv);
	            var m = jQuery(_this.mergelyDiv);
	            m.mergely({
	                cmsettings: {
	                    readOnly: false,
	                    lineNumbers: true,
	                    lineWrapping: true,
	                },
	                lhs_cmsettings: {
	                    readOnly: (!_this.editBoth) && (!_this.editLeft)
	                },
	                rhs_cmsettings: {
	                    readOnly: (!_this.editBoth) && _this.editLeft
	                },
	                editor_height: "100%",
	                lhs: function (setValue) {
	                    setValue(lhsText);
	                },
	                rhs: function (setValue) {
	                    setValue(rhsText);
	                },
	            });
	            _this.getLeftCM().on("change", function (cm, obj) {
	                if (_this.editLeft) {
	                    _this.file.SetWorkingExists(true);
	                }
	                else {
	                    _this.file.SetTheirExists(true);
	                }
	            });
	            _this.getRightCM().on("change", function (cm, obj) {
	                if (_this.editLeft) {
	                    _this.file.SetTheirExists(true);
	                }
	                else {
	                    _this.file.SetWorkingExists(true);
	                }
	            });
	        });
	    };
	    return MergeEditor;
	}());

	var MergeInstructions = /** @class */ (function (_super) {
	    tslib_1.__extends(MergeInstructions, _super);
	    function MergeInstructions(parent, editor) {
	        var _this = _super.call(this) || this;
	        if (!parent) {
	            return _this;
	        }
	        _this.$.theirSide.innerHTML = editor.TheirSide();
	        _this.$.ourSide.innerHTML = editor.WorkingSide();
	        _this.$.show.addEventListener("click", function (evt) {
	            evt.preventDefault();
	            evt.stopPropagation();
	            _this.el.classList.toggle("showing");
	        });
	        parent.appendChild(_this.el);
	        return _this;
	    }
	    return MergeInstructions;
	}(conflict_MergeInstructions));

	var CommitMessageDialog$1 = /** @class */ (function (_super) {
	    tslib_1.__extends(CommitMessageDialog, _super);
	    function CommitMessageDialog(clearOnOpen) {
	        var _this = _super.call(this) || this;
	        _this.clearOnOpen = clearOnOpen;
	        _this.dialog = new FoundationRevealDialog$1(undefined, _this.el);
	        _this.dialog.Events.add(_this.dialogEvent, _this);
	        _this.$.commit.addEventListener("click", function (evt) {
	            evt.stopPropagation();
	            evt.preventDefault();
	            _this.resolve({
	                Message: _this.$.message.value,
	                Notes: "",
	                Cancelled: false
	            });
	            _this.resolve = undefined;
	            _this.dialog.Close();
	        });
	        return _this;
	    }
	    CommitMessageDialog.prototype.dialogEvent = function (evt) {
	        switch (evt) {
	            case DialogEvents.Closed:
	                // If the commit button was pressed, we have resolved
	                // the promise, and have cleared this.resolve
	                if (this.resolve) {
	                    this.resolve({ Cancelled: true });
	                }
	                return;
	            case DialogEvents.Opened:
	                if (this.clearOnOpen) {
	                    this.$.message.value = "";
	                }
	                return;
	        }
	    };
	    // Open returns a Promise that will return a string[]. The string[]
	    // will either contain two elements: 
	    CommitMessageDialog.prototype.Open = function (title, instructions) {
	        var _this = this;
	        this.$.title.innerText = title;
	        this.$.instructions.innerText = instructions;
	        return new Promise(function (resolve, reject) {
	            _this.resolve = resolve;
	            _this.dialog.Open();
	        });
	    };
	    return CommitMessageDialog;
	}(CommitMessageDialog));

	var ClosePRDialog = /** @class */ (function (_super) {
	    tslib_1.__extends(ClosePRDialog, _super);
	    function ClosePRDialog(clearOnOpen) {
	        var _this = _super.call(this) || this;
	        // firstOpen is set false after the first time the dialog is opened.
	        // This allows us to initialize default values iff this is the first usage,
	        // or to go with the user's settings if this is not the first usage.
	        _this.firstOpen = true;
	        _this.clearOnOpen = clearOnOpen;
	        _this.dialog = new FoundationRevealDialog$1(undefined, _this.el);
	        _this.dialog.Events.add(_this.dialogEvent, _this);
	        Eventify(_this.el, {
	            "change": function (evt) {
	                evt.stopPropagation();
	                evt.preventDefault();
	                console.log("Clicked ", evt.target);
	                var close = evt.target.getAttribute("value") == "yes";
	                if (close) {
	                    _this.$.closeMessage.removeAttribute('disabled');
	                }
	                else {
	                    _this.$.closeMessage.setAttribute('disabled', 'disabled');
	                }
	            },
	            "done": function (evt) {
	                console.log("done event");
	                evt.stopPropagation();
	                evt.preventDefault();
	                _this.resolve({
	                    Close: _this.$.closePR_yes.checked,
	                    CloseMessage: _this.$.closeMessage.value,
	                    Cancelled: false
	                });
	                _this.resolve = undefined;
	                _this.dialog.Close();
	            }
	        });
	        return _this;
	    }
	    ClosePRDialog.prototype.dialogEvent = function (evt) {
	        switch (evt) {
	            case DialogEvents.Closed:
	                // If the commit button was pressed, we have resolved
	                // the promise, and have cleared this.resolve
	                if (this.resolve) {
	                    this.resolve({ Cancelled: true });
	                }
	                return;
	            case DialogEvents.Opened:
	                if (this.clearOnOpen) ;
	                return;
	        }
	    };
	    // Open returns a Promise that will return a string[]. The string[]
	    // will either contain two elements: 
	    ClosePRDialog.prototype.Open = function (title, instructions, defaultSetting) {
	        var _this = this;
	        this.$.title.innerText = title;
	        this.$.instructions.innerText = instructions;
	        if (defaultSetting && this.firstOpen) {
	            this.firstOpen = true;
	            this.$.closePR_yes.checked = defaultSetting.Close;
	            this.$.closePR_no.checked = !(this.$.closePR_yes.checked);
	            if (this.$.closePR_yes.checked) {
	                this.$.closeMessage.removeAttribute("disabled");
	            }
	            else {
	                this.$.closeMessage.setAttribute("disabled", "disabled");
	            }
	        }
	        if (this.clearOnOpen) {
	            this.$.closePR_yes.checked = false;
	            this.$.closePR_no.checked = true;
	            this.$.closeMessage.setAttribute('disabled', 'disabled');
	        }
	        return new Promise(function (resolve, reject) {
	            _this.resolve = resolve;
	            _this.dialog.Open();
	        });
	    };
	    return ClosePRDialog;
	}(conflict_ClosePRDialog));

	// MergingInfo is the typescript equivalent of the EBWRepoStatus which provides
	// some information on how the repo came to be in a conflict state.
	var MergingInfo = /** @class */ (function () {
	    function MergingInfo(dataEl) {
	        if (!dataEl) {
	            dataEl = document.getElementById("merging-info");
	        }
	        var js = JSON.parse(dataEl.innerText);
	        this.PRNumber = js.MergingPRNumber;
	        this.Description = js.MergingDescription;
	    }
	    MergingInfo.prototype.IsPRMerge = function () {
	        return (0 < this.PRNumber);
	    };
	    return MergingInfo;
	}());

	var SingleEditor = /** @class */ (function () {
	    function SingleEditor(context, parent) {
	        this.context = context;
	        this.parent = parent;
	        this.Listen = new signals.Signal();
	        this.controls = new MergeEditorControlBar();
	        this.controls.Listen.add(this.controlAction, this);
	        this.imageEditor = undefined;
	        this.editor = undefined;
	    }
	    SingleEditor.prototype.controlAction = function (act) {
	        var _this = this;
	        switch (act) {
	            case MergeEditorAction.Save:
	                this.SaveFile()
	                    .catch(EBW$1.Error);
	                break;
	            case MergeEditorAction.Delete:
	                break;
	            case MergeEditorAction.Resolve:
	                this.SaveFile()
	                    .then(function () {
	                    // undefined so we receive notifications
	                    return _this.file.Stage(undefined);
	                })
	                    .then(function () {
	                    EBW$1.Toast("Resolved changes on " + _this.file.Path());
	                })
	                    .catch(EBW$1.Error);
	                break;
	            case MergeEditorAction.RevertOur:
	                this.file.RevertOur(undefined);
	                break;
	            case MergeEditorAction.RevertTheir:
	                this.file.RevertOurToTheir(undefined);
	                break;
	            case MergeEditorAction.RevertGit:
	                this.file.RevertOurToGit(undefined);
	                break;
	        }
	    };
	    SingleEditor.prototype.WorkingSide = function () {
	        return "-";
	    };
	    SingleEditor.prototype.TheirSide = function () {
	        return '-';
	    };
	    SingleEditor.prototype.getWorkingText = function () {
	        return this.editor.getValue();
	    };
	    SingleEditor.prototype.setWorkingText = function (s) {
	        this.editor.setValue(s);
	    };
	    SingleEditor.prototype.isWorkingDeleted = function () {
	        return this.isDeleted;
	    };
	    SingleEditor.prototype.SaveFile = function () {
	        if (this.imageEditor) {
	            return Promise.resolve("");
	        }
	        if (this.file) {
	            var f_1 = this.file;
	            var w = this.getWorkingText();
	            // We pass ourselves as the source, so that we don't update
	            // our editor when the change event arrives
	            this.file.SetWorkingContent(this, this.isWorkingDeleted() ? undefined :
	                this.getWorkingText());
	            return this.file.Save()
	                .then(function () {
	                EBW$1.Toast("Saved " + f_1.Path());
	                return Promise.resolve("");
	            });
	        }
	        return Promise.reject("No file to save");
	    };
	    SingleEditor.prototype.FileEventListener = function (source, e, fc) {
	        // If we were ourselves the source of the event, we ignore it.
	        if (source == this) {
	            return;
	        }
	        switch (e) {
	            case FileEvent.WorkingChanged:
	                this.setWorkingText(fc.Raw);
	                break;
	            case FileEvent.StatusChanged:
	                break;
	        }
	    };
	    // Merge starts merging a file.
	    SingleEditor.prototype.Merge = function (file) {
	        var _this = this;
	        console.log("Merge: " + file.Path());
	        if (this.file && this.file.Path() == file.Path()) {
	            return; // Nothing to do if we're selecting the same file
	        }
	        // Save any file we're currently editing
	        if (this.file) {
	            if (!this.imageEditor) {
	                this.SaveFile();
	            }
	            this.file.Listen.remove(this.FileEventListener, this);
	            this.file = undefined;
	        }
	        // Controls must receive update before we do.
	        // TODO : Actually, the controls should listen to US, not to the
	        // file, and we should have an 'EditorStateModel'...
	        if (ImageIdentify.isImage(file.Path())) {
	            this.parent.textContent = "";
	            this.imageEditor = new MergeImageEditor(this.context, this.parent, file.Path());
	            this.file = file;
	            this.file.Listen.add(this.FileEventListener, this);
	            console.log("created new MergeImageEditor with parent ", this.parent);
	            this.controls.setImageEditing(true);
	            return;
	        }
	        this.controls.setImageEditing(false);
	        this.imageEditor = null;
	        this.parent.innerHTML = "";
	        this.editor = new EditorCodeMirror(this.parent);
	        //this.controls.SetFile(file);
	        // VERY importantly, we don't listen to the file 
	        // until after we've concluded the FetchContent, because
	        // we won't have an editor to populate when FetchContent
	        // sends its signals that the content has changed.
	        // However, because we configure ourselves as the source,
	        // if we were listening, it shouldn't be a problem...
	        var p = file.FetchContent(this)
	            .then(function () {
	            return Promise.all([file.WorkingFile(), file.TheirFile()]);
	        })
	            .then(function (args) {
	            var _a = [args[0], args[1]], working = _a[0];
	            _this.file = file;
	            _this.file.Listen.add(_this.FileEventListener, _this);
	            console.log("About to set file contents to ", working.Raw);
	            if (working.Exists) {
	                _this.editor.setValue(working.Raw);
	            }
	            else {
	                _this.editor.setValue("");
	            }
	            _this.editor.setModeOnFilename(file.Path());
	        });
	    };
	    return SingleEditor;
	}());

	// RepoConflictPage handles conflict-merging for the repo.
	// It's main data is generated in public/repo_conflict.html
	var RepoConflictPage = /** @class */ (function () {
	    function RepoConflictPage(context) {
	        var _this = this;
	        this.context = context;
	        this.mergingInfo = new MergingInfo(document.getElementById("merging-info"));
	        this.closePRDialog = new ClosePRDialog(false);
	        var fileList = new FileList(context);
	        var fileListDisplay = new FileListDisplay(context, document.getElementById("staged-files-list"), fileList, this.mergingInfo);
	        fileListDisplay.el.addEventListener("file-click", function (evt) {
	            _this.fileListEvent(undefined, evt.detail.file);
	            // Mark editor as file loaded
	            var editorPane = document.getElementById('editor');
	            editorPane
	                .setAttribute('data-file-in-editor', evt.detail.file.path);
	            // Remove existing, and add new filename to repo flow
	            if (document.querySelector('.repo-flow-repo-name .file-title')) {
	                document.querySelector('.repo-flow-repo-name .file-title').remove();
	            }
	            var filename = editorPane.getAttribute('data-file-in-editor');
	            var filenameParent = document.querySelector(".repo-flow-repo-name");
	            filenameParent.innerHTML
	                += '<span class="file-title">'
	                    + filename
	                    + '</span>';
	        });
	        if (this.mergingInfo.IsPRMerge()) {
	            this.editor = new MergeEditor$1(context, document.getElementById("editor-work"));
	            new MergeInstructions(document.getElementById('merge-instructions'), this.editor);
	        }
	        else {
	            var work = document.getElementById("editor-work");
	            this.editor = new SingleEditor(context, work);
	        }
	        // items to be hidden in a PR merge or a not-pr-merge are controlled
	        // by CSS visibility based on whether they have a .pr-merge or .not-pr-merge
	        // class
	        this.commitDialog = new CommitMessageDialog$1(false);
	        new ControlTag(document.getElementById("files-show-tag"), function (showing) {
	            var el = document.getElementById("files");
	            // Toggle 'showing' class
	            if (showing)
	                el.classList.add("showing");
	            else
	                el.classList.remove("showing");
	            // Toggle body class
	            document.body.classList.toggle('editorMaximised');
	            // Show/hide files container (avoids leaving scrollbar visible)
	            document.getElementById("staged-files-list")
	                .style.display = showing ? "block" : "none";
	            // Hide repo actions
	            document.getElementById("repo-file-actions")
	                .style.visibility = showing ? "visible" : "hidden";
	            // Hide repo conflict actions (avoids encouraging user
	            // to accept before resolving all file conflicts)
	            document.querySelector('.repo-conflict-actions')
	                .style.display = showing ? 'flex' : 'none';
	            // Hide footer
	            document.getElementById("page-footer")
	                .style.display = showing ? 'flex' : 'none';
	        });
	        var filesEl = document.getElementById('staged-files-data');
	        if (!filesEl) {
	            EBW$1.Error("FAILED TO FIND #staged-files-data: cannot instantiate RepoConflictPage");
	            return;
	        }
	        var listjs = filesEl.innerText;
	        var fileListData = JSON.parse(listjs);
	        fileList.load(fileListData);
	        document.getElementById("action-commit").addEventListener("click", function (evt) {
	            evt.preventDefault();
	            evt.stopPropagation();
	            console.log("IN action-commit CLICK LISTENER");
	            EBW$1.API().IsRepoConflicted(_this.context.RepoOwner, _this.context.RepoName)
	                .then(function (_a) {
	                var conflicted = _a[0];
	                if (conflicted) {
	                    EBW$1.Alert("You need to resolve all file conflicts before you can resolve the merge.");
	                    return Promise.resolve();
	                }
	                return _this.commitDialog.Open("Resolve Conflict", "The merge will be resolved.")
	                    .then(function (r) {
	                    if (r.Cancelled) {
	                        return;
	                    }
	                    console.log("Result= ", r);
	                    _this.context.RepoRedirect("conflict/resolve", new Map([["message", r.Message], ["notes", r.Notes]]));
	                    return;
	                });
	            })
	                .catch(EBW$1.Error);
	        });
	        document.getElementById("action-abort").addEventListener("click", function (evt) {
	            evt.preventDefault();
	            evt.stopPropagation();
	            if (_this.mergingInfo.IsPRMerge()) {
	                _this.closePRDialog.Open("Close submission", "You have been merging submission " + _this.mergingInfo.PRNumber + ".\n\t\t\t\t\tDo you want to reject the submission permanently?", { Close: false, CloseMessage: "", Cancelled: false })
	                    .then(function (r) {
	                    if (r.Cancelled) {
	                        return;
	                    }
	                    _this.context.RepoRedirect("conflict/abort", new Map([["message", r.CloseMessage],
	                        ["close", r.Close]]));
	                    return;
	                })
	                    .catch(EBW$1.Error);
	            }
	            else {
	                _this.context.RepoRedirect("conflict/abort");
	            }
	        });
	    }
	    RepoConflictPage.prototype.fileListEvent = function (e, f) {
	        this.editor.Merge(f);
	    };
	    return RepoConflictPage;
	}());

	var MergeEditor$2 = /** @class */ (function (_super) {
	    tslib_1.__extends(MergeEditor, _super);
	    function MergeEditor(parent, model) {
	        var _this = _super.call(this) || this;
	        _this.parent = parent;
	        _this.model = model;
	        Eventify(_this.el, {
	            'save': function (evt) {
	                evt.preventDefault();
	                model.Update(_this.get())
	                    .catch(function (err) {
	                    console.log("Error on the save function");
	                    EBW$1.Error(err);
	                });
	            }
	        });
	        AddToParent(_this.parent, _this.el);
	        model.GetContent()
	            .then(function (args) { return _this.mergely(args); })
	            .catch(EBW$1.Error);
	        return _this;
	    }
	    MergeEditor.prototype.get = function () {
	        var cm = jQuery(this.mergelyDiv).mergely('cm', 'lhs');
	        return cm.getDoc().getValue();
	    };
	    MergeEditor.prototype.mergely = function (_a) {
	        var _this = this;
	        var local = _a[0], remote = _a[1], diff = _a[2];
	        this.$.mergely.textContent = "";
	        this.mergelyDiv = document.createElement("div");
	        this.$.mergely.appendChild(this.mergelyDiv);
	        var m = jQuery(this.mergelyDiv);
	        m.mergely({
	            cmsettings: {
	                readOnly: false,
	                lineNumbers: true,
	                wrap_lines: true,
	            },
	            rhs_cmsettings: {
	            // readOnly: true,
	            },
	            // editor_height: "40em",
	            autoresize: true,
	            editor_height: "100%",
	            // editor_width: "48%",
	            wrap_lines: true,
	            lhs: function (setValue) {
	                setValue(local);
	            },
	            rhs: function (setValue) {
	                setValue(remote);
	            },
	            height: function (h) {
	                return _this.$.mergely.clientHeight + "px";
	            },
	            width: function (w) {
	                return _this.$.mergely.clientWidth + "px";
	            }
	        });
	        var right = jQuery(this.mergelyDiv).mergely('cm', 'rhs');
	        console.log('right hand cm = ', right);
	    };
	    return MergeEditor;
	}(MergeEditor));

	var PRDiffModel = /** @class */ (function () {
	    function PRDiffModel(diff, prArgs) {
	        this.diff = diff;
	        this.prArgs = prArgs;
	        this.DirtySignal = new signals.Signal();
	        this.EditingSignal = new signals.Signal();
	    }
	    PRDiffModel.prototype.path = function () {
	        return this.diff.path;
	    };
	    PRDiffModel.prototype.key = function () {
	        return this.diff.remote_hash + ":" + this.diff.local_hash;
	    };
	    PRDiffModel.prototype.origKey = function () {
	        return this.key + '-original';
	    };
	    PRDiffModel.prototype.GetContent = function () {
	        console.log("calling API.PullRequestVersions(", JSON.stringify(this.prArgs), this.diff.path, ")");
	        return EBW$1.API().PullRequestVersions(this.prArgs.repoOwner, this.prArgs.repoName, this.prArgs.remoteURL, this.prArgs.remoteSHA, this.diff.path);
	    };
	    PRDiffModel.prototype.Update = function (content) {
	        return EBW$1.API().PullRequestUpdate(this.prArgs.repoOwner, this.prArgs.repoName, this.prArgs.remoteSHA, this.diff.path, content);
	    };
	    return PRDiffModel;
	}());

	var PullRequestDiffList_File$1 = /** @class */ (function (_super) {
	    tslib_1.__extends(PullRequestDiffList_File, _super);
	    function PullRequestDiffList_File(parent, diff, callback) {
	        var _this = _super.call(this) || this;
	        _this.parent = parent;
	        _this.diff = diff;
	        _this.callback = callback;
	        _this.el.textContent = diff.path();
	        _this.el.addEventListener('click', function (evt) {
	            _this.callback(_this.diff);
	        });
	        parent.appendChild(_this.el);
	        return _this;
	    }
	    return PullRequestDiffList_File;
	}(PullRequestDiffList_File));

	var PullRequestMergePage = /** @class */ (function () {
	    function PullRequestMergePage(diffs, prArgs, filesParent, mergelyParent) {
	        var _this = this;
	        this.prArgs = prArgs;
	        this.filesParent = filesParent;
	        this.mergelyParent = mergelyParent;
	        this.files = [];
	        if (!this.filesParent) {
	            alert("PullRequestMergePage called, but filesParent is undefined");
	            debugger;
	        }
	        for (var _i = 0, diffs_1 = diffs; _i < diffs_1.length; _i++) {
	            var d = diffs_1[_i];
	            var diff = new PRDiffModel(d, prArgs);
	            this.files.push(diff);
	            new PullRequestDiffList_File$1(this.filesParent, diff, function (d) {
	                _this.viewDiff(d);
	            });
	        }
	    }
	    PullRequestMergePage.prototype.viewDiff = function (diff) {
	        this.mergelyParent.textContent = '';
	        new MergeEditor$2(this.mergelyParent, diff);
	    };
	    PullRequestMergePage.instantiate = function () {
	        var pr = document.getElementById('pr-merge-page');
	        if (pr) {
	            new PullRequestMergePage(JSON.parse(pr.textContent), {
	                repoOwner: pr.getAttribute("repo-owner"),
	                repoName: pr.getAttribute("repo-name"),
	                remoteURL: pr.getAttribute("remote-url"),
	                remoteSHA: pr.getAttribute("remote-sha")
	            }, document.getElementById("pr-files-list"), document.getElementById("mergely-container"));
	        }
	    };
	    return PullRequestMergePage;
	}());

	var CommitSummary = /** @class */ (function () {
	    function CommitSummary(when, oid, message) {
	        this.when = when;
	        this.oid = oid;
	        this.message = message;
	    }
	    CommitSummary.prototype.When = function () {
	        return this.when;
	    };
	    CommitSummary.prototype.Message = function () {
	        return this.message;
	    };
	    CommitSummary.prototype.OID = function () {
	        return this.oid;
	    };
	    return CommitSummary;
	}());

	var CommitSummaryList = /** @class */ (function () {
	    function CommitSummaryList() {
	        this.listeners = new Array();
	    }
	    CommitSummaryList.prototype.addListener = function (l) {
	        this.listeners.push(l);
	    };
	    CommitSummaryList.prototype.removeListener = function (l) {
	        this.listeners.remove(l);
	    };
	    CommitSummaryList.prototype.add = function (cs) {
	        this.listeners.forEach(function (l) { return l.addCommit(cs); });
	    };
	    return CommitSummaryList;
	}());

	var CommitSummaryView$1 = /** @class */ (function (_super) {
	    tslib_1.__extends(CommitSummaryView, _super);
	    function CommitSummaryView(parent) {
	        var _this = _super.call(this) || this;
	        parent.appendChild(_this.el);
	        _this.el.addEventListener('click', function (evt) {
	            evt.preventDefault();
	            evt.stopPropagation();
	            _this.el.dispatchEvent(new CustomEvent('commit-click', {
	                'detail': _this,
	                'bubbles': true,
	                'cancelable': true
	            }));
	        });
	        return _this;
	    }
	    CommitSummaryView.prototype.set = function (cs) {
	        this.commit = cs;
	        // Set human time string. Leave locale undefined,
	        // so that the user gets their default locale's format.
	        var humanDate = new Date(cs.When())
	            .toLocaleDateString(undefined, {
	            weekday: 'long',
	            year: 'numeric',
	            month: 'long',
	            day: 'numeric',
	            hour: 'numeric',
	            minute: 'numeric'
	        });
	        this.$.when.textContent = humanDate;
	        this.$.message.textContent = cs.Message();
	    };
	    CommitSummaryView.prototype.OID = function () {
	        return this.commit.OID();
	    };
	    CommitSummaryView.prototype.Select = function (state) {
	        this.el.classList.toggle('selected', state);
	        console.log("toggled selected state on ", this.el);
	    };
	    return CommitSummaryView;
	}(CommitSummaryView));

	var CommitSummaryListView$1 = /** @class */ (function (_super) {
	    tslib_1.__extends(CommitSummaryListView, _super);
	    function CommitSummaryListView(parent, list) {
	        var _this = _super.call(this) || this;
	        parent.appendChild(_this.el);
	        list.addListener(_this);
	        _this.selected = undefined;
	        // console.log(`CommitSummaryListView, this.$ = `, this.$);
	        _this.el.addEventListener("commit-click", function (evt) {
	            if (_this.selected) {
	                _this.selected.Select(false);
	            }
	            _this.selected = evt.detail;
	            _this.selected.Select(true);
	        });
	        return _this;
	    }
	    CommitSummaryListView.prototype.addCommit = function (c) {
	        var csv = new CommitSummaryView$1(this.$.summaries);
	        csv.set(c);
	    };
	    return CommitSummaryListView;
	}(CommitSummaryListView));

	var RepoDiffDatesForm = /** @class */ (function () {
	    function RepoDiffDatesForm(context) {
	        var _this = this;
	        this.context = context;
	        console.log("RepoDiffDatesForm");
	        this.fromDate = document.getElementById("from-date");
	        this.toDate = document.getElementById("to-date");
	        this.button = document.getElementById("diff-dates-button");
	        var checkClick = function (evt) {
	            // console.log(`fromDate = '${this.fromDate.value}', toDate = '${this.toDate.value}'`)
	            if (("" == _this.fromDate.value) || ("" == _this.toDate.value)) {
	                _this.button.disabled = true;
	                return;
	            }
	            _this.button.disabled = false;
	        };
	        this.fromDate.addEventListener("input", checkClick);
	        this.toDate.addEventListener("input", checkClick);
	        checkClick();
	        /*
	        
	        // moved on to form submission, so no button handling required
	        // bar enabling /  disabling.
	        //

	        if (!this.button) {
	            console.error(`Failed to find diff-dates-button`);
	            return;
	        }

	        this.button.addEventListener(`click`, (evt)=>{
	            evt.preventDefault();
	            evt.stopPropagation();

	            let from = this.fromDate.value;
	            let to = this.toDate.value;
	            this.context.RepoRedirect(`diff-dates/${from}/${to}`, null);
	        });
	        */
	    }
	    return RepoDiffDatesForm;
	}());
	var RepoDiffViewerPage = /** @class */ (function () {
	    function RepoDiffViewerPage(context) {
	        var _this = this;
	        this.context = context;
	        var commits = JSON.parse(document.getElementById('commit-summaries').innerText);
	        var summaries = new CommitSummaryList();
	        var fromList = new CommitSummaryListView$1(document.getElementById("commit-from"), summaries);
	        var toList = new CommitSummaryListView$1(document.getElementById("commit-to"), summaries);
	        commits.forEach(function (c) {
	            summaries.add(new CommitSummary(c.When, c.OID, c.Message));
	        });
	        fromList.el.addEventListener("commit-click", function (evt) {
	            _this.fromOID = evt.detail.OID();
	            _this.enableViewButton();
	        });
	        toList.el.addEventListener("commit-click", function (evt) {
	            _this.toOID = evt.detail.OID();
	            _this.enableViewButton();
	        });
	        this.viewButton = document.getElementById("diff-view");
	        this.enableViewButton();
	        this.viewButton.addEventListener("click", function (evt) {
	            evt.preventDefault();
	            evt.stopPropagation();
	            context.RepoRedirect("diff/" + _this.fromOID + "/" + _this.toOID);
	        });
	        new RepoDiffDatesForm(context);
	    }
	    RepoDiffViewerPage.prototype.enableViewButton = function () {
	        var disable = (this.fromOID == undefined) || (this.toOID == undefined);
	        this.viewButton.disabled = disable;
	        // console.log(`viewButton.disabled = ${this.viewButton.disabled}`);
	    };
	    return RepoDiffViewerPage;
	}());

	var RepoDiffFileViewerPage = /** @class */ (function () {
	    function RepoDiffFileViewerPage(context, parent, data) {
	        var _this = this;
	        this.context = context;
	        this.parent = parent;
	        this.data = data;
	        this.root = new Node(null, "", NodeType.DIR, null);
	        this.fileMap = new Map();
	        this.data.diffs.forEach(function (d) {
	            _this.fileMap.set("/" + d.Path, d);
	        });
	        this.styler = function (n, el) {
	            var f = n.path();
	            var diff = _this.fileMap.get(f);
	            if (diff) {
	                el.classList.add(diff.State);
	            }
	        };
	        this.fsv = new FileSystemView(context, this.root, this.parent, this.data.ignoreFilter, null, // no NotifyFS
	        this.styler);
	        this.fsv.prepopulate(this.data.diffs.map(function (i) { return i.Path; }));
	        this.parent.addEventListener("ebw-file-clicked", function (evt) {
	            var diff = _this.fileMap.get(evt.detail);
	            if (!diff) {
	                console.error("CLICKED FILE " + evt.detail + " BUT FAILED TO FIND DIFF");
	                return;
	            }
	            var src = "/repo/" + _this.context.RepoOwner + "/" + _this.context.RepoName + "/" + diff.URL;
	            document.getElementById("diff-view").src = src;
	            document.getElementById("diff-view").classList.add('file-loaded');
	        });
	    }
	    return RepoDiffFileViewerPage;
	}());

	var PrintButton = /** @class */ (function () {
	    function PrintButton(button) {
	        this.button = button;
	        this.button.addEventListener('click', function (evt) {
	            evt.preventDefault();
	            evt.stopPropagation();
	            window.print();
	        });
	        this.button.style.visibility = 'visible';
	    }
	    return PrintButton;
	}());

	var WordWrapButton = /** @class */ (function () {
	    function WordWrapButton(button, container) {
	        var _this = this;
	        this.button = button;
	        this.container = container;
	        this.KEY = "ebw-word-wrap";
	        button.addEventListener('click', function (evt) {
	            evt.preventDefault();
	            evt.stopPropagation();
	            _this.toggle();
	        });
	        this.setWordWrap(this.isWordWrap());
	        this.button.style.visibility = 'visible';
	    }
	    WordWrapButton.prototype.isWordWrap = function () {
	        var v = window.localStorage.getItem(this.KEY);
	        if (null == v) {
	            return true;
	        }
	        return "false" != v;
	    };
	    WordWrapButton.prototype.setWordWrap = function (w) {
	        window.localStorage.setItem(this.KEY, w ? "true" : "false");
	        if (w) {
	            this.button.classList.add("wordwrap");
	            this.container.classList.add("wordwrap");
	        }
	        else {
	            this.button.classList.remove("wordwrap");
	            this.container.classList.remove("wordwrap");
	        }
	    };
	    WordWrapButton.prototype.toggle = function () {
	        this.setWordWrap(!this.isWordWrap());
	    };
	    return WordWrapButton;
	}());

	var RepoDiffPatchPage = /** @class */ (function () {
	    function RepoDiffPatchPage(context) {
	        this.context = context;
	        document.body.classList.add("repo-diff-patch-page");
	        console.log("added repo-diff-patch-page to body classes");
	        new WordWrapButton(document.getElementById('wrap-button'), document.getElementById('repo-diff-patch'));
	        new PrintButton(document.getElementById('print-button'));
	    }
	    return RepoDiffPatchPage;
	}());

	var DOMInsert = /** @class */ (function () {
	    function DOMInsert(parent) {
	        this.parent = parent;
	    }
	    DOMInsert.prototype.Insert = function (el) {
	        if ('function' == typeof this.parent) {
	            this.parent(el);
	        }
	        else {
	            this.parent.appendChild(el);
	        }
	    };
	    return DOMInsert;
	}());

	var RepoFileViewerFile$1 = /** @class */ (function (_super) {
	    tslib_1.__extends(RepoFileViewerFile, _super);
	    function RepoFileViewerFile(context, filename, parent, page) {
	        var _this = _super.call(this) || this;
	        _this.context = context;
	        _this.filename = filename;
	        _this.page = page;
	        _this.version = 1;
	        _this.Refresh();
	        _this.$.filename.innerHTML = _this.filename ? _this.filename : "Drop a file here to upload it.<br>Drop a file on any image to replace it.";
	        parent.Insert(_this.el);
	        if (_this.IsAddButton()) {
	            _this.el.setAttribute('title', 'Drop a file here to upload it');
	            _this.el.classList.add('repo-file-drop');
	        }
	        _this.el.addEventListener('drop', function (evt) {
	            evt.preventDefault();
	            // Necessary so the browser doesn't just display the dropped item
	            console.log("Going to run this.page.FileDrop");
	            _this.page.FileDrop(_this, evt);
	        });
	        _this.el.addEventListener('drag', function (evt) {
	        });
	        _this.el.addEventListener('dragover', function (evt) {
	            evt.preventDefault();
	            _this.el.classList.add('file-dragover');
	        });
	        _this.el.addEventListener('dragleave', function (evt) {
	            evt.preventDefault();
	            _this.el.classList.remove('file-dragover');
	        });
	        _this.el.addEventListener("dragend", function (evt) {
	            evt.preventDefault();
	            var dt = evt.dataTransfer;
	            console.log("dragend: dt = ", dt);
	            if (dt.items) {
	                for (var i = 0; i < dt.items.length; i++) {
	                    dt.items.remove(i);
	                }
	            }
	            else {
	                dt.clearData();
	            }
	        });
	        return _this;
	    }
	    RepoFileViewerFile.prototype.Refresh = function () {
	        var src = "/img/plus.svg";
	        if ("" != this.filename) {
	            src = "/www/" + this.context.RepoOwner + "/" + this.context.RepoName + "/" + this.filename + "?v=" + (this.version++);
	        }
	        this.$.img.setAttribute('src', src);
	    };
	    RepoFileViewerFile.prototype.Filename = function () {
	        return this.filename;
	    };
	    // IsAddButton returns true if this RepoFileViewerFile is in fact just the generic
	    // 'add a new file' button
	    RepoFileViewerFile.prototype.IsAddButton = function () {
	        return "" == this.filename;
	    };
	    return RepoFileViewerFile;
	}(RepoFileViewerFile));

	var EditField = /** @class */ (function () {
	    function EditField(el, page) {
	        var _this = this;
	        this.el = el;
	        this.page = page;
	        this.value = el.value;
	        this.el.addEventListener("keyup", function (evt) {
	            var v = el.value;
	            if (v != _this.value) {
	                _this.value = v;
	                page.ValueChanged(v);
	            }
	        });
	    }
	    return EditField;
	}());
	var LoadFiles = /** @class */ (function () {
	    function LoadFiles(context, listener) {
	        this.context = context;
	        this.listener = listener;
	    }
	    LoadFiles.prototype.Search = function (s) {
	        var _this = this;
	        console.log("LoadFiles.Search(" + s + ")");
	        this.searchingFor = s;
	        EBW$1.API()
	            .SearchForFiles(this.context.RepoOwner, this.context.RepoName, s)
	            .then(function (_a) {
	            var search = _a[0], files = _a[1];
	            if (search != _this.searchingFor) {
	                return;
	            }
	            _this.listener.FilesFound(files);
	        });
	    };
	    return LoadFiles;
	}());
	var RepoFileViewerPage$1 = /** @class */ (function (_super) {
	    tslib_1.__extends(RepoFileViewerPage, _super);
	    function RepoFileViewerPage(context, parent) {
	        var _this = _super.call(this) || this;
	        _this.context = context;
	        _this.add = new RepoFileViewerFile$1(_this.context, "", new DOMInsert(_this.$.data), _this);
	        _this.inserter = new DOMInsert(function (el) {
	            // Insert file after the drag-and-drop box
	            _this.$.data.appendChild(el);
	        });
	        parent.appendChild(_this.el);
	        _this.$.search.focus();
	        _this.loadFiles = new LoadFiles(context, _this);
	        new EditField(_this.$.search, _this);
	        return _this;
	    }
	    RepoFileViewerPage.prototype.ValueChanged = function (s) {
	        s = s + ".*\\.(png|jpg|jpeg|svg|gif|tiff)$";
	        this.loadFiles.Search(s);
	    };
	    RepoFileViewerPage.prototype.FilesFound = function (files) {
	        console.log("FilesFound: ", files);
	        var e = this.$.data.firstChild;
	        while (e) {
	            var next = e.nextSibling;
	            if (e != this.add.el) {
	                this.$.data.removeChild(e);
	            }
	            e = next;
	        }
	        for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
	            var f = files_1[_i];
	            new RepoFileViewerFile$1(this.context, f, this.inserter, this);
	        }
	    };
	    RepoFileViewerPage.prototype._uploadFile = function (src, file) {
	        var _this = this;
	        // READ THE FILE
	        var reader = new FileReader();
	        reader.addEventListener("loadend", function (evt) {
	            //console.log(`READ file. result=`, reader.result);
	            //console.log(`Replacing file ${this.filename} with result`);
	            var u8 = new Uint8Array(reader.result); //Uint8Array.from(reader.result);
	            //console.log(`u8 = `, u8);
	            var blen = u8.byteLength;
	            //console.log(`blen = `, blen);
	            var binary = "";
	            for (var i = 0; i < blen; i++) {
	                binary += String.fromCharCode(u8[i]);
	            }
	            var p;
	            if ("" != src.Filename()) {
	                p = Promise.resolve(src.Filename());
	            }
	            else {
	                p = EBW$1.Prompt("Enter the path and filename for this file to go to, e.g. book/images/web/cover.jpg");
	            }
	            p.then(function (s) {
	                if ("" == s)
	                    return Promise.resolve("");
	                return EBW$1.API().UpdateFileBinary(_this.context.RepoOwner, _this.context.RepoName, s, window.btoa(binary))
	                    .then(function () {
	                    return Promise.resolve(s);
	                });
	            })
	                .then(function (s) {
	                if ("" != s) {
	                    if (!src.IsAddButton()) {
	                        src.Refresh();
	                    }
	                    else {
	                        new RepoFileViewerFile$1(_this.context, s, _this.inserter, _this);
	                    }
	                    EBW$1.Toast("Image uploaded");
	                }
	            })
	                .catch(EBW$1.Error);
	        });
	        reader.readAsArrayBuffer(file);
	    };
	    RepoFileViewerPage.prototype.FileDrop = function (src, evt) {
	        var dt = evt.dataTransfer;
	        console.log("dt = ", dt);
	        if (dt.items) {
	            for (var i = 0; i < dt.items.length; i++) {
	                var item = dt.items[i];
	                if (item.kind == "file") ;
	                this._uploadFile(src, item.getAsFile());
	            }
	        }
	        else {
	            console.log("dt.files = ", dt.files);
	            for (var i = 0; i < dt.files.length; i++) {
	                var file = dt.files[i];
	                var imageType = /^image\//;
	                if (!imageType.test(file.type)) {
	                    alert("You can only upload image files with this form.");
	                    continue;
	                }
	                this._uploadFile(src, file);
	            }
	        }
	    };
	    return RepoFileViewerPage;
	}(RepoFileViewerPage));

	var EBW$1 = /** @class */ (function () {
	    function EBW() {
	        if (null != EBW.instance) {
	            console.log("EBW.instance already set");
	            debugger;
	        }
	        if (null == EBW.instance) {
	            console.log("Creating EBW.instance");
	            EBW.instance = this;
	            this.api = new APIWs();
	            jQuery(document).foundation();
	            LoginTokenList$1.init();
	            var el = document.getElementById("ebw-context");
	            var context = void 0;
	            if (el) {
	                context = new Context(el, el.getAttribute("data-username"), el.getAttribute("data-repo-owner"), el.getAttribute("data-repo-name"));
	                switch (el.getAttribute('data-page')) {
	                    case 'RepoDetailPage':
	                        new RepoDetailPage(context);
	                        break;
	                    case 'RepoConflictPage':
	                        new RepoConflictPage(context);
	                        break;
	                    case 'RepoDiffViewerPage':
	                        new RepoDiffViewerPage(context);
	                        break;
	                    case 'RepoDiffFileViewerPage':
	                        new RepoDiffFileViewerPage(context, document.getElementById("all-files-editor"), window.pageData);
	                        break;
	                    case 'RepoFileViewerPage':
	                        new RepoFileViewerPage$1(context, document.getElementById("repo-file-viewer"));
	                        break;
	                    case 'RepoEditorPage':
	                        new RepoEditorPage(context, document.querySelector("[data-instance='AllFilesList']"), window.repoEditorData.files, window.repoEditorData.ignoreFilter, window.repoEditorData.filesAndHashes);
	                        break;
	                    case 'RepoDiffPatchPage':
	                        new RepoDiffPatchPage(context);
	                        break;
	                }
	            }
	            /* TODO: This should actually use a Router
	               to determine what content we have. */
	            AddNewBookDialog$1.instantiate();
	            PullRequestMergePage.instantiate();
	        }
	        return EBW.instance;
	    }
	    /**
	     * GetInstance returns the singleton instance of EBW
	     */
	    EBW.GetInstance = function () {
	        if (!EBW.instance) {
	            EBW.instance = new EBW();
	        }
	        return EBW.instance;
	    };
	    EBW.API = function () {
	        return EBW.GetInstance().api;
	    };
	    EBW.Error = function (err) {
	        console.error('ERROR: ', err);
	        debugger;
	        alert(err);
	    };
	    EBW.Alert = function (msg) {
	        alert(msg);
	        return Promise.resolve();
	    };
	    EBW.Toast = function (msg) {
	        var args = [];
	        for (var _i = 1; _i < arguments.length; _i++) {
	            args[_i - 1] = arguments[_i];
	        }
	        Toast.Show(msg + args.join(' '));
	    };
	    EBW.Prompt = function (msg) {
	        var r = prompt(msg);
	        return Promise.resolve(r);
	    };
	    EBW.Confirm = function (msg) {
	        return Promise.resolve(confirm(msg));
	    };
	    // flatten takes returns a function that accepts an 
	    // array of arguments, and calls the callback function
	    // with each array element as a distinct parameter.
	    EBW.flatten = function (callback, context) {
	        return function (argsArray) {
	            callback.apply(context, argsArray);
	        };
	    };
	    return EBW;
	}());
	document.addEventListener('DOMContentLoaded', function () {
	    console.log("DOMContentLoaded - EBW");
	    new EBW$1();
	});

	exports.EBW = EBW$1;

	return exports;

}({}, tslib, TSFoundation));
