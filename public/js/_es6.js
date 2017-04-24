"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var api_instance = false;

var API = function API() {
	_classCallCheck(this, API);

	if (!api_instance) {
		api_instance = new APIHttp();
	}
	return api_instance;
};
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var API = function () {
	function API() {
		var path = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "/rpc/API/json";
		var server = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";

		var _timeout = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

		_classCallCheck(this, API);

		this._timeout = 0;
		if ("" == server) {
			server = document.location.protocol + "//" + document.location.host;
		}
		this.url = server + path;
		this.clearRPCErrorHandler();
	}

	_createClass(API, [{
		key: "setTimeout",
		value: function setTimeout(ts) {
			this._timeout = ts;
		}
	}, {
		key: "setRPCErrorHandler",
		value: function setRPCErrorHandler() {
			var _errorHandler = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

			this._errorHandler = _errorHandler;
			if (false == this._errorHandler) {
				this._errorHandler = function (err) {
					console.error("RPC Error: ", e);
					alert("RPC ERROR: " + e);
				};
			}
		}
	}, {
		key: "clearRPCErrorHandler",
		value: function clearRPCErrorHandler() {
			this._errorHandler = false;
		}
	}, {
		key: "_reject",
		value: function _reject(reject, err) {
			if (false != this._errorHandler) {
				this._errorHandler(err);
			}
			reject(err);
		}
	}, {
		key: "_rpc",
		value: function _rpc(method, params) {
			var _this = this;

			// params comes in as an 'arguments' object, so we need to convert
			// it to an array
			params = Array.prototype.slice.call(params);
			// let p = [];
			// for (let i=0; i<p.length; i++) {
			// 	p[i] = params[i]
			// }

			return new Promise(function (resolve, reject) {
				var req = null;
				if (window.XMLHttpRequest) {
					req = new XMLHttpRequest();
				} else if (window.ActiveXObject) {
					req = new ActiveXObject("Microsoft.XMLHTTP");
				} else {
					_this._reject(reject, "No supported HttpRequest implementation");
					return;
				}

				var bind = function bind(resolve, reject, req) {
					return function () {
						if (4 == req.readyState) {
							if (200 == req.status) {
								var res = req.response;
								if (null == res) {
									_this._reject(reject, "Failed to parse response: " + req.response);
									return;
								}
								if (null != res.error) {
									_this._reject(reject, res.error);
									return;
								}
								if (null != res.result) {
									resolve(res.result);
									return;
								}
								// This is a send-and-forget JSON RPC request (ie one without id)
								// We don't actually support this at this point... I think...
								resolve(null);
								return;
							}
							console.log("Request = ", req);
							_this._reject(reject, "Failed with " + req.statusText);
						}
					};
				};

				req.onreadystatechange = bind(resolve, reject, req);
				req.timeout = _this._timeout;
				req.open("POST", _this.url + "?" + method, true);
				req.responseType = "json";
				req.send(JSON.stringify({ id: _this._id++, method: method, params: params }));
			});
		}
	}, {
		key: "Version",
		value: function Version() {
			return this._rpc("Version", arguments);
		}
	}, {
		key: "DeleteFile",
		value: function DeleteFile(repoOwner, repoName, path) {
			return this._rpc("DeleteFile", arguments);
		}
	}, {
		key: "ListFiles",
		value: function ListFiles(repoOwner, repoName, pathregex) {
			return this._rpc("ListFiles", arguments);
		}
	}, {
		key: "ListAllRepoFiles",
		value: function ListAllRepoFiles(repoOwner, repoName) {
			return this._rpc("ListAllRepoFiles", arguments);
		}
	}, {
		key: "GetFile",
		value: function GetFile(repoOwner, repoName, path) {
			return this._rpc("GetFile", arguments);
		}
	}, {
		key: "GetFileString",
		value: function GetFileString(repoOwner, repoName, path) {
			return this._rpc("GetFileString", arguments);
		}
	}, {
		key: "UpdateFile",
		value: function UpdateFile(repoOwner, repoName, path, content) {
			return this._rpc("UpdateFile", arguments);
		}
	}, {
		key: "ListPullRequests",
		value: function ListPullRequests(repoOwner, repoName) {
			return this._rpc("ListPullRequests", arguments);
		}
	}, {
		key: "PullRequestDiffList",
		value: function PullRequestDiffList(repoOwner, repoName, sha, regexp) {
			return this._rpc("PullRequestDiffList", arguments);
		}
	}, {
		key: "PullRequestVersions",
		value: function PullRequestVersions(repoOwner, repoName, remoteUrl, remoteSha, filePath) {
			return this._rpc("PullRequestVersions", arguments);
		}
	}, {
		key: "PullRequestUpdate",
		value: function PullRequestUpdate(repoOwner, repoName, remoteSHA, filePath, data) {
			return this._rpc("PullRequestUpdate", arguments);
		}
	}, {
		key: "Commit",
		value: function Commit(repoOwner, repoName, message) {
			return this._rpc("Commit", arguments);
		}
	}, {
		key: "PrintPdfEndpoint",
		value: function PrintPdfEndpoint(repoOwner, repoName, book) {
			return this._rpc("PrintPdfEndpoint", arguments);
		}
	}, {
		key: "flatten",
		value: function flatten(callback) {
			var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

			return function (argsArray) {
				callback.apply(context, argsArray);
			};
		}
	}]);

	return API;
}();

// Define the class in the window and make AMD compatible


window.API = API;
if ("function" == typeof window.define && window.define.amd) {
	window.define("API", [], function () {
		return window.API;
	});
}
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var APIWs = function () {
	function APIWs() {
		var path = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "/rpc/API/json/ws";
		var server = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";

		_classCallCheck(this, APIWs);

		if ("" == server) {
			server = "ws" + ("https:" == document.location.protocol ? "s" : "") + "://" + document.location.host;
		}
		this._id = 0;
		this.url = server + path;
		this.live = {};
		this.queue = [];
		this.setRPCErrorHandler(null);
		this.startWs();
	}

	_createClass(APIWs, [{
		key: "setRPCErrorHandler",
		value: function setRPCErrorHandler() {
			var _errorHandler = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

			this._errorHandler = _errorHandler;
		}
	}, {
		key: "_reject",
		value: function _reject(reject, err) {
			if (null != this._errorHandler) {
				this._errorHandler(err);
			}
			reject(err);
			return;
		}
	}, {
		key: "startWs",
		value: function startWs() {
			var _this = this;

			this.ws = new WebSocket(this.url);
			this.ws.onmessage = function (evt) {
				var res = JSON.parse(evt.data);
				if (undefined == res || undefined == res.id) {
					console.error("Failed to parse response: " + evt.data);
					return;
				}
				var promise = _this.live[res.id];
				if (undefined == promise) {
					console.error("Failed to find promise for " + evt.data);
					return;
				}
				delete _this.live[res.id];
				if (null != res.error) {
					_this._reject(promise.reject, res.error);
					return;
				}
				if (null != res.result) {
					promise.resolve(res.result);
					return;
				}
				promise.resolve(null);
			};
			this.ws.onerror = function (err) {
				console.error("ERROR on websocket:", err);
			};
			this.ws.onopen = function (evt) {
				console.log("Connected websocket");
				var _iteratorNormalCompletion = true;
				var _didIteratorError = false;
				var _iteratorError = undefined;

				try {
					for (var _iterator = _this.queue[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
						var q = _step.value;

						_this.ws.send(q);
					}
				} catch (err) {
					_didIteratorError = true;
					_iteratorError = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion && _iterator.return) {
							_iterator.return();
						}
					} finally {
						if (_didIteratorError) {
							throw _iteratorError;
						}
					}
				}

				console.log("Emptied queue of " + _this.queue.length + " queued messages");
				_this.queue = [];
			};
			this.ws.onclose = function (evt) {
				console.log("Websocket closed - attempting reconnect in 1s");
				setTimeout(function () {
					return _this.startWs();
				}, 1000);
			};
		}
	}, {
		key: "_rpc",
		value: function _rpc(method, params) {
			var _this2 = this;

			var id = this._id++;
			// params comes in as an 'arguments' object, so we need to convert
			// it to an array
			params = Array.prototype.slice.call(params);
			// let p = [];
			// for (let i=0; i<p.length; i++) {
			// 	p[i] = params[i]
			// }

			var data = JSON.stringify({ id: id, method: method, params: params });
			this.live[id] = {
				resolve: null,
				reject: null
			};
			return new Promise(function (resolve, reject) {
				_this2.live[id].resolve = resolve;
				_this2.live[id].reject = reject;
				if (1 == _this2.ws.readyState) {
					_this2.ws.send(data);
				} else {
					_this2.queue.push(data);
				}
			});
		}
	}, {
		key: "Version",
		value: function Version() {
			return this._rpc("Version", arguments);
		}
	}, {
		key: "DeleteFile",
		value: function DeleteFile(repoOwner, repoName, path) {
			return this._rpc("DeleteFile", arguments);
		}
	}, {
		key: "ListFiles",
		value: function ListFiles(repoOwner, repoName, pathregex) {
			return this._rpc("ListFiles", arguments);
		}
	}, {
		key: "ListAllRepoFiles",
		value: function ListAllRepoFiles(repoOwner, repoName) {
			return this._rpc("ListAllRepoFiles", arguments);
		}
	}, {
		key: "GetFile",
		value: function GetFile(repoOwner, repoName, path) {
			return this._rpc("GetFile", arguments);
		}
	}, {
		key: "GetFileString",
		value: function GetFileString(repoOwner, repoName, path) {
			return this._rpc("GetFileString", arguments);
		}
	}, {
		key: "UpdateFile",
		value: function UpdateFile(repoOwner, repoName, path, content) {
			return this._rpc("UpdateFile", arguments);
		}
	}, {
		key: "ListPullRequests",
		value: function ListPullRequests(repoOwner, repoName) {
			return this._rpc("ListPullRequests", arguments);
		}
	}, {
		key: "PullRequestDiffList",
		value: function PullRequestDiffList(repoOwner, repoName, sha, regexp) {
			return this._rpc("PullRequestDiffList", arguments);
		}
	}, {
		key: "PullRequestVersions",
		value: function PullRequestVersions(repoOwner, repoName, remoteUrl, remoteSha, filePath) {
			return this._rpc("PullRequestVersions", arguments);
		}
	}, {
		key: "PullRequestUpdate",
		value: function PullRequestUpdate(repoOwner, repoName, remoteSHA, filePath, data) {
			return this._rpc("PullRequestUpdate", arguments);
		}
	}, {
		key: "Commit",
		value: function Commit(repoOwner, repoName, message) {
			return this._rpc("Commit", arguments);
		}
	}, {
		key: "PrintPdfEndpoint",
		value: function PrintPdfEndpoint(repoOwner, repoName, book) {
			return this._rpc("PrintPdfEndpoint", arguments);
		}
	}, {
		key: "flatten",
		value: function flatten(callback) {
			var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

			return function (argsArray) {
				callback.apply(context, argsArray);
			};
		}
	}]);

	return APIWs;
}();

// Define the class in the window and make AMD compatible


window.APIWs = APIWs;
if ("function" == typeof window.define && window.define.amd) {
	window.define("APIWs", [], function () {
		return window.APIWs;
	});
}
'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// AddNewBookDialog steps the user through two pages
// determining what sort of new book they want to create,
// and where the original of that book should be found:
// ie copy the ebw electricbook template, or fork an existing
// book.
var AddNewBookDialog = function AddNewBookDialog(parent) {
	var _this = this;

	_classCallCheck(this, AddNewBookDialog);

	var _DTemplate = DTemplate('AddNewBookDialog');

	var _DTemplate2 = _slicedToArray(_DTemplate, 2);

	this.el = _DTemplate2[0];
	this.$ = _DTemplate2[1];

	Eventify(this.el, {
		'choseType': function choseType() {
			var newBook = this.$.newBookRadio.checked;
			var collaborate = this.$.collaborateRadio.checked;
			if (!newBook && !collaborate) {
				alert('You need to choose one or the other');
				return;
			}
			if (newBook) {
				this.$.newBook.style.display = 'block';
				this.$.repo_name.focus();
			} else {
				this.$.collaborate.style.display = 'block';
				this.$.collaborate_repo.focus();
			}
			this.$.chooseType.style.display = 'none';
		}
	}, this);

	jQuery(parent).bind('open.zf.reveal', function (evt) {
		_this.$.chooseType.style.display = 'block';
		_this.$.newBookRadio.checked = false;
		_this.$.collaborateRadio.checked = false;

		_this.$.newBook.style.display = 'none';
		_this.$.repo_name.value = '';

		_this.$.collaborate.style.display = 'none';
		_this.$.collaborate_repo.value = '';
	});

	parent.appendChild(this.el);
};

window.AddNewBookDialog = AddNewBookDialog;
"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * AllFilesEditor is a control that allows the user to select
 * any file from the repo.
 */
var AllFilesEditor = function AllFilesEditor(parent, dir, chooseFileCallback) {
	_classCallCheck(this, AllFilesEditor);

	if (null == parent) {
		console.log("NO parent for AllFilesEditor");
		return;
	}
	this.dir = dir;
	this.chooseFileCallback = chooseFileCallback;

	var _DTemplate = DTemplate("AllFilesEditor");

	var _DTemplate2 = _slicedToArray(_DTemplate, 2);

	this.el = _DTemplate2[0];
	this.$ = _DTemplate2[1];
	var _iteratorNormalCompletion = true;
	var _didIteratorError = false;
	var _iteratorError = undefined;

	try {
		for (var _iterator = dir.FileNamesOnly()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
			var f = _step.value;

			if ("." != f[0]) {
				var o = document.createElement("option");
				o.setAttribute("value", f);
				o.textContent = f;
				this.$.select.appendChild(o);
			}
		}
	} catch (err) {
		_didIteratorError = true;
		_iteratorError = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion && _iterator.return) {
				_iterator.return();
			}
		} finally {
			if (_didIteratorError) {
				throw _iteratorError;
			}
		}
	}

	Eventify(this.el, {
		'change': function change(evt) {
			var f = this.$.select.value;
			console.log("selected " + f);
			this.chooseFileCallback(this, f);
		}
	}, this);
	parent.appendChild(this.el);
};
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AllFilesList = function AllFilesList(repoOwner, repoName, editor) {
	var _this = this;

	_classCallCheck(this, AllFilesList);

	this.editor = editor;
	this.repoOwner = repoOwner;
	this.repoName = repoName;
	this.api = EBW.API();
	this.api.ListAllRepoFiles(repoOwner, repoName).then(this.api.flatten(function (js) {
		var d = Directory.FromJS(false, js);
		new AllFilesEditor(document.getElementById("all-files-editor"), d, function (_source, file) {
			var rfm = new RepoFileModel(_this.repoOwner, _this.repoName, file, { newFile: false });
			_this.editor.setFile(rfm);
		});
	})).catch(EBW.Error);
};
"use strict";

var DTemplate = function () {

	var templates = { "AddNewBookDialog": "<div>\n\t<div data-set=\"chooseType\">\n\t\t<h1>Add a New Book</h1>\n\t\t<fieldset>\n\t\t\t<label>\n\t\t\t\t<input type=\"radio\" value=\"new\" data-set=\"newBookRadio\" />\n\t\t\t\tStart an new book.\n\t\t\t</label>\n\t\t\t<label>\n\t\t\t\t<input type=\"radio\" value=\"collaborate\"\n\t\t\t\tdata-set=\"collaborateRadio\" />\n\t\t\t\tCollaborate on an existing book.\n\t\t\t</label>\n\t\t</fieldset>\n\t\t<button data-event=\"click:choseType\" class=\"btn\">Next</button>\n\t</div>\n\t<div data-set=\"newBook\" style=\"display: none;\">\n\t\t<h1>New Book</h1>\n\t\t<form method=\"post\" action=\"/github/create/new\">\n\t\t<input type=\"hidden\" name=\"action\" value=\"new\" />\n\t\t<label>Enter the name for your new book.\n\t\t<input type=\"text\" name=\"repo_new\" placeholder=\"e.g. MobyDick\" data-set=\"repo_name\"/>\n\t\t</label>\n\t\t<input type=\"submit\" class=\"btn\" value=\"New Book\"/>\n\t\t</form>\n\t</div>\n\t<div data-set=\"collaborate\">\n\t\t<h1>Collaborate</h1>\n\t\t<form method=\"post\" action=\"/github/create/fork\">\n\t\t<input type=\"hidden\" name=\"action\" value=\"fork\" />\n\t\t<label>Enter the owner and repo for the book you will collaborate on.\n\t\t<input type=\"text\" name=\"collaborate_repo\" placeholder=\"e.g. electricbooks/core\" data-set=\"collaborate_repo\" />\n\t\t</label>\n\t\t<input type=\"submit\" class=\"btn\" value=\"Collaborate\" />\n\t\t</form>\n\t</div>\n</div>\n", "AllFilesEditor": "<div class=\"all-files-editor\">\n\t<select data-set=\"select\" data-event=\"change\">\n\t</select>\n</div>", "MergeEditor": "<div class=\"merge-editor\">\n\t<div class=\"toolbar-menu\">\n\t\t<button data-event=\"click:save\" class=\"btn\">Save</button>\n\t</div>\n\t<div class=\"merge-mergely\" data-set=\"mergely\">\n\t</div>\n</div>", "PullRequestDiffList": "<div>\n\t<ul data-set=\"list\">\n\t</ul>\n\t<button data-set=\"closePR\"><i class=\"fa fa-check\"> </i></button>\n</div>", "PullRequestLink": "<div class=\"pull-request-link\">\n\t<a href=\"#\" data-set=\"link\">_</a>\n</div>", "RepoFileEditLink": "<ul>\n\t<li class=\"edit-link\" data-set=\"this\" data-event=\"click\">\n\t\t<span class=\"file-dirty-tag\"><i data-set=\"editing\" class=\"fa fa-pencil\"> </i></span>\n\t\t<a href=\"#\"><span data-set=\"name\"> </span></a>\n\t</li>\n</ul>\n", "RepoFileEditor_ace": "<div class=\"repo-file-editor-workspace\">\t\n\t<div class=\"toolbar-menu\">\n\t\t<button data-event=\"click:save\" data-set=\"save\"><i class=\"fa fa-save\"> </i></button>\n\t\t<button data-event=\"click:undo\" data-set=\"undo\"><i class=\"fa fa-undo\"> </i></button>\n\t\t<div class=\"spacer\"> </div>\n\t\t<button data-event=\"click:delete\"><i class=\"fa fa-trash\"> </i></button>\n\t</div>\n\t<div class=\"repo-file-editor repo-file-editor-ace\" data-set=\"editor\">\n\t</div>\n</div>", "RepoFileEditor_codemirror": "<div class=\"repo-file-editor-workspace\">\n\t<div class=\"repo-file-editor\" data-set=\"editor\">\n\t</div>\n</div>\n", "RepoFileList": "<div class=\"repo-file-list\">\n\t<div class=\"menu-header repo-files\">\n\t\t<h2 class=\"menu-title\">Files</h2>\n\t</div>\n\t<ul class=\"action-group\" id=\"files\" data-set=\"fileList\">\n\t</ul>\n\t<button data-event='click:click-new'>Add new file</button>\n</div>\n" };

	var mk = function mk(k, html) {
		var el = document.createElement('div');
		el.innerHTML = html;

		var c = el.firstElementChild;
		while (null != c && Node.ELEMENT_NODE != c.nodeType) {
			c = c.nextSibling;
		}
		if (null == c) {
			console.error("FAILED TO FIND ANY ELEMENT CHILD OF ", k, ":", el);
			return mk('error', '<em>No child elements in template ' + k + '</em>');
		}
		el = c;
		var et = el.querySelector('[data-set="this"]');
		if (null != et) {
			el = et;
			el.removeAttribute('data-set');
		}
		return el;
	};

	for (var i in templates) {
		templates[i] = mk(i, templates[i]);
	}

	return function (t) {
		var dest = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

		// Return a deep copy of the node
		var n = templates[t].cloneNode(true);
		try {
			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = QuerySelectorAllIterate(n, '[data-set]')[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var el = _step.value;

					var a = el.getAttribute('data-set');
					if (a.substr(0, 1) == '$') {
						a = a.substr(1);
						el = jQuery(el);
					}
					dest[a] = el;
				}
			} catch (err) {
				_didIteratorError = true;
				_iteratorError = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion && _iterator.return) {
						_iterator.return();
					}
				} finally {
					if (_didIteratorError) {
						throw _iteratorError;
					}
				}
			}
		} catch (err) {
			console.error("ERROR in DTemplate(" + t + "): ", err);
			debugger;
		}
		return [n, dest];
	};
}();
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ebw_instance = null;

var EBW = function () {
	function EBW() {
		_classCallCheck(this, EBW);

		if (null == ebw_instance) {
			ebw_instance = this;
			this.api = new APIWs();
		}
		return ebw_instance;
	}

	_createClass(EBW, null, [{
		key: 'API',
		value: function API() {
			var ebw = new EBW();
			return ebw.api;
		}
	}, {
		key: 'Error',
		value: function Error(err) {
			console.error('ERROR: ', err);
			debugger;
			alert(err);
		}
	}, {
		key: 'Toast',
		value: function (_Toast) {
			function Toast(_x) {
				return _Toast.apply(this, arguments);
			}

			Toast.toString = function () {
				return _Toast.toString();
			};

			return Toast;
		}(function (msg) {
			Toast.Show(msg);
		})
	}, {
		key: 'Prompt',
		value: function Prompt(msg) {
			var r = prompt(msg);
			if ('' == r) {
				r = false;
			}
			return Promise.resolve('' == r ? false : r);
		}
	}, {
		key: 'flatten',
		value: function flatten(callback) {
			var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

			return function (argsArray) {
				callback.apply(context, argsArray);
			};
		}
	}]);

	return EBW;
}();

window.EBW = EBW;

document.addEventListener('DOMContentLoaded', function () {
	jQuery(document).foundation();
});
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var EditorCodeMirror = function () {
	function EditorCodeMirror(parent) {
		_classCallCheck(this, EditorCodeMirror);

		this.cm = CodeMirror(parent, {
			'mode': 'markdown',
			'lineNumbers': true,
			'lineWrapping': true
		});
	}

	_createClass(EditorCodeMirror, [{
		key: 'getValue',
		value: function getValue() {
			return this.cm.getDoc().getValue();
		}
	}, {
		key: 'setValue',
		value: function setValue(s) {
			this.cm.getDoc().setValue(s);
			// this.cm.setSize('100%','100%');
			this.cm.refresh();
			// this.cm.setSize('100%','100%');
		}
	}], [{
		key: 'Template',
		value: function Template() {
			return 'RepoFileEditor_codemirror';
		}
	}]);

	return EditorCodeMirror;
}();
'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

/**
 * Eventify adds eventListeners to the given object
 * for each node in the given element and it's sub-elements
 * that has an attribute of the form:
 * data-event="event:method,event:method,..."
 * When the named event occurs on the element, the named
 * method will be called on the object.
 */
window.Eventify = function (el, methods) {
	var context = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
	var _iteratorNormalCompletion = true;
	var _didIteratorError = false;
	var _iteratorError = undefined;

	try {
		for (var _iterator = QuerySelectorAllIterate(el, '[data-event]')[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
			var e = _step.value;

			var evtList = e.getAttribute('data-event');
			var _iteratorNormalCompletion2 = true;
			var _didIteratorError2 = false;
			var _iteratorError2 = undefined;

			try {
				var _loop = function _loop() {
					var p = _step2.value;

					var _p$split = p.split(':'),
					    _p$split2 = _slicedToArray(_p$split, 2),
					    event = _p$split2[0],
					    method = _p$split2[1];

					if (!method) {
						method = event;
					}
					if (undefined == methods[method]) {
						console.error('No method ' + method + ' (from ' + p + ') defined on ', methods, ' while eventifying ', el);
						return 'continue';
					}
					e.addEventListener(event, function (evt) {
						if (context) {
							methods[method].apply(context, [evt]);
						} else {
							methods[method](evt);
						}
					});
				};

				for (var _iterator2 = evtList.split(',')[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
					var _ret = _loop();

					if (_ret === 'continue') continue;
				}
			} catch (err) {
				_didIteratorError2 = true;
				_iteratorError2 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion2 && _iterator2.return) {
						_iterator2.return();
					}
				} finally {
					if (_didIteratorError2) {
						throw _iteratorError2;
					}
				}
			}
		}
	} catch (err) {
		_didIteratorError = true;
		_iteratorError = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion && _iterator.return) {
				_iterator.return();
			}
		} finally {
			if (_didIteratorError) {
				throw _iteratorError;
			}
		}
	}
};
'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MergeEditor = function () {
	function MergeEditor(parent, model) {
		_classCallCheck(this, MergeEditor);

		console.log('new MergeEditor: parent=', parent);
		this.model = model;

		var _DTemplate = DTemplate('MergeEditor');

		var _DTemplate2 = _slicedToArray(_DTemplate, 2);

		this.el = _DTemplate2[0];
		this.$ = _DTemplate2[1];

		Eventify(this.el, {
			'save': function save(evt) {
				evt.preventDefault();
				model.Update(this.get()).then().catch(function (err) {
					console.log('Error on the save function');
					EBW.Error(err);
				});
			}
		}, this);

		if ('function' == typeof parent) {
			parent(this.el);
		} else {
			parent.appendChild(this.el);
		}

		model.GetContent().then(EBW.flatten(this.mergely, this)).catch(EBW.Error);
	}

	_createClass(MergeEditor, [{
		key: 'get',
		value: function get() {
			var cm = jQuery(this.mergely).mergely('cm', 'lhs');
			return cm.getDoc().getValue();
		}
	}, {
		key: 'mergely',
		value: function mergely(local, remote, diff) {
			this.$.mergely.textContent = '';
			this.mergely = document.createElement('div');
			this.$.mergely.appendChild(this.mergely);
			var m = jQuery(this.mergely);
			m.mergely({
				cmsettings: {
					readOnly: false,
					lineNumbers: true
				},
				editor_height: "100%",
				lhs: function lhs(setValue) {
					setValue(local);
				},
				rhs: function rhs(setValue) {
					setValue(remote);
				}
			});
			var right = jQuery(this.mergely).mergely('cm', 'rhs');
			console.log('right hand cm = ', right);
		}
	}]);

	return MergeEditor;
}();
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * PRDiffModel provides a model of a single diff
 * between local and remote
 * diff =  Object { 
 *    path: "book/text/01.md", 
 *    remote_path: "/home/craig/proj/ebw/git_cache/pr_r…", 
 *    remote_hash: "e9c882ca90909485619b340312151904146…", 
 *    local_path: "/home/craig/proj/ebw/git_cache/repo…", 
 *    local_hash: "b73db84fa8269f29c7a5daade4bd21731f5…",
 *    equal: false 
 * }
 */
var PRDiffModel = function () {
	function PRDiffModel(diff, prArgs) {
		_classCallCheck(this, PRDiffModel);

		this.diff = diff;
		this.prArgs = prArgs;

		this.DirtySignal = new signals.Signal();
		this.EditingSignal = new signals.Signal();
	}

	_createClass(PRDiffModel, [{
		key: 'GetContent',
		value: function GetContent() {
			console.log('calling API.PullRequestVersions(', this.prArgs['repoOwner'], ',', this.prArgs['repoName'], ',', this.prArgs['remoteURL'], ',', this.prArgs['remoteSHA'], ',', this.diff.path);

			return EBW.API().PullRequestVersions(this.prArgs['repoOwner'], this.prArgs['repoName'], this.prArgs['remoteURL'], this.prArgs['remoteSHA'], this.diff.path);
		}
	}, {
		key: 'Update',
		value: function Update(content) {
			return EBW.API().PullRequestUpdate(this.prArgs['repoOwner'], this.prArgs['repoName'], this.prArgs['remoteSHA'], this.diff.path, content);
		}
	}, {
		key: 'path',
		get: function get() {
			return this.diff.path;
		}
	}, {
		key: 'key',
		get: function get() {
			return this.diff.remove_hash + ":" + this.diff.local_hash;
		}
	}, {
		key: 'origKey',
		get: function get() {
			return this.key + '-original';
		}
	}]);

	return PRDiffModel;
}();
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PrintListener = function () {
	function PrintListener(repoOwner, repoName) {
		var _this = this;

		var book = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "book";

		_classCallCheck(this, PrintListener);

		this.repoOwner = repoOwner;
		this.repoName = repoName;
		if ("" == book) {
			book = "book";
		}
		this.book = book;
		EBW.API().PrintPdfEndpoint(repoOwner, repoName, book).then(function (args) {
			_this.startListener(args[0]);
		}).catch(EBW.Error);
	}

	_createClass(PrintListener, [{
		key: "startListener",
		value: function startListener(key) {
			var _this2 = this;

			var url = document.location.protocol + "//" + document.location.host + "/print/sse/" + key;
			var sse = new EventSource(url);
			sse.addEventListener("open", function () {});
			sse.addEventListener('tick', function (e) {
				console.log("tick received: ", e);
			});
			sse.addEventListener("info", function (e) {
				// console.log(`INFO on printListener: `, e.data);
				var data = JSON.parse(e.data);
				Toast.Show("Printing: ", data);
			});
			sse.addEventListener("error", function (e) {
				var err = JSON.parse(e.data);
				EBW.Error(err);
				sse.close();
			});
			sse.addEventListener("output", function (e) {
				var data = JSON.parse(e.data);
				var url = document.location.protocol + "//" + document.location.host + ("/www/" + _this2.repoOwner + "/" + _this2.repoName + "/" + data);
				Toast.Show("Your PDF is ready: opening in a new window.");
				window.open(url, _this2.repoOwner + "-" + _this2.repoName + "-pdf");
			});
			sse.addEventListener("done", function (e) {
				sse.close();
			});
			sse.onmessage = function (e) {
				_this2.onmessage(e);
			};
			sse.onerror = EBW.Error;
		}
	}, {
		key: "onmessage",
		value: function onmessage(e) {
			console.log("PrintListener.onmessage: ", e);
		}
	}]);

	return PrintListener;
}();

window.PrintListener = PrintListener;
'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PullRequestDiffList = function () {
	function PullRequestDiffList(parent, diffs, prArgs, mergelyParent) {
		var _this = this;

		_classCallCheck(this, PullRequestDiffList);

		this.prArgs = prArgs;
		this.mergelyParent = mergelyParent;

		var _DTemplate = DTemplate('PullRequestDiffList');

		var _DTemplate2 = _slicedToArray(_DTemplate, 2);

		this.el = _DTemplate2[0];
		this.$ = _DTemplate2[1];

		this.files = [];
		console.log('DIFFERENCE LIST = ', diffs);
		var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
		var _iteratorError = undefined;

		try {
			var _loop = function _loop() {
				var d = _step.value;

				var f = new PRDiffModel(d, prArgs);
				console.log("DIFFERENCE: ", d);
				_this.files.push(f);
				new RepoFileEditLink(_this.el, f, function (x, file) {
					_this.viewDiff(f);
				});
			};

			for (var _iterator = diffs[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
				_loop();
			}
		} catch (err) {
			_didIteratorError = true;
			_iteratorError = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion && _iterator.return) {
					_iterator.return();
				}
			} finally {
				if (_didIteratorError) {
					throw _iteratorError;
				}
			}
		}

		parent.appendChild(this.el);
	}

	_createClass(PullRequestDiffList, [{
		key: 'viewDiff',
		value: function viewDiff(diff) {
			this.mergelyParent.textContent = '';
			new MergeEditor(this.mergelyParent, diff);
		}
	}]);

	return PullRequestDiffList;
}();

window.PullRequestDiffList = PullRequestDiffList;
"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PullRequestLink = function PullRequestLink(parent, repo, pr) {
	_classCallCheck(this, PullRequestLink);

	this.pr = pr;

	var _DTemplate = DTemplate("PullRequestLink");

	var _DTemplate2 = _slicedToArray(_DTemplate, 2);

	this.el = _DTemplate2[0];
	this.$ = _DTemplate2[1];

	this.$.link.textContent = this.pr.title;
	this.$.link.href = repo + "/pull/" + this.pr.number;
	parent.appendChild(this.el);
};
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PullRequestList = function PullRequestList(parent, repo) {
	_classCallCheck(this, PullRequestList);

	if (null == parent) {
		console.error("parent required for PullRequestList");
		debugger;
	}
	this.parent = parent;
	this.api = EBW.API();
	this.api.ListPullRequests(repo).then(this.api.flatten(function (prlist) {
		var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
		var _iteratorError = undefined;

		try {
			for (var _iterator = prlist[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
				var pr = _step.value;

				new PullRequestLink(parent, repo, pr);
			}
		} catch (err) {
			_didIteratorError = true;
			_iteratorError = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion && _iterator.return) {
					_iterator.return();
				}
			} finally {
				if (_didIteratorError) {
					throw _iteratorError;
				}
			}
		}
	})).catch(function (err) {
		EBW.Error(err);
	});
};

window.PullRequestList = PullRequestList;
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var RepoDirectoryModel = function RepoDirectoryModel() {
	_classCallCheck(this, RepoDirectoryModel);
};
'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * RepoEditorPage is the JS controller for the page that allows
 * editing of a repo.
 */
var RepoEditorPage = function RepoEditorPage(repoOwner, repoName) {
	var _this = this;

	_classCallCheck(this, RepoEditorPage);

	this.repoOwner = repoOwner;
	this.repoName = repoName;
	this.editor = new RepoFileEditorCM(document.getElementById('editor'));
	this.files = new RepoFileList(document.getElementById('files'), repoOwner, repoName, this.editor);
	//new PullRequestList(document.getElementById('pull-request-list'), repo);
	window.addEventListener('beforeunload', function (evt) {
		// transfer editor to file text
		_this.editor.setFile(null);
		if (_this.files.IsDirty()) {
			evt.returnValue = 'confirm';
			evt.stopPropagation();
		}
	});
	document.getElementById('repo-commit').addEventListener('click', function (evt) {
		// @TODO Need to check that all files are saved - or at least prompt user...
		evt.preventDefault();
		evt.stopPropagation();
		EBW.Prompt('Enter the commit message:').then(function (msg) {
			if (msg) {
				EBW.Toast('Committing ' + msg);
				EBW.API().Commit(_this.repoOwner, _this.repoName, msg).then(function () {
					EBW.Toast('Changes committed: ' + msg);
				}).catch(EBW.Error);
			}
		});
	});
	document.getElementById('repo-print').addEventListener('click', function (evt) {
		evt.preventDefault();evt.stopPropagation();
		console.log('Starting printing...');
		EBW.Toast('Printing in progress...');
		new PrintListener(_this.repoOwner, _this.repoName, 'book');
	});
	document.getElementById('repo-jekyll').addEventListener('click', function (evt) {
		evt.preventDefault();evt.stopPropagation();
		var l = document.location;
		var jekyllUrl = l.protocol + '//' + l.host + '/jekyll/' + _this.repoOwner + '/' + _this.repoName + '/';
		console.log('URL = ' + jekyllUrl);
		window.open(jekyllUrl, _this.repoOwner + '-' + _this.repoName + '-jekyll');
	});
};

window.RepoEditorPage = RepoEditorPage;
'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var RepoFileEditLink = function () {
	function RepoFileEditLink(parent, file, click) {
		var _this = this;

		_classCallCheck(this, RepoFileEditLink);

		this.parent = parent;
		this.file = file;

		var _DTemplate = DTemplate('RepoFileEditLink');

		var _DTemplate2 = _slicedToArray(_DTemplate, 2);

		this.el = _DTemplate2[0];
		this.$ = _DTemplate2[1];

		this.$.name.textContent = this.file.path.substring('book/text/'.length);
		this.click = click;
		this.file.EditingSignal.add(function (f, editing) {
			_this.SetEditing(editing);
		});
		this.SetEditing(false);
		this.file.DirtySignal.add(function (f, dirty) {
			if (dirty) {
				_this.el.classList.add('file-dirty');
			} else {
				_this.el.classList.remove('file-dirty');
			}
		});
		Eventify(this.el, {
			'click': function click(evt) {
				evt.preventDefault();
				this.click(this, this.file);
			}
		}, this);

		if (parent) {
			parent.appendChild(this.el);
		}
	}

	_createClass(RepoFileEditLink, [{
		key: 'SetEditing',
		value: function SetEditing(editing) {
			this.$.editing.style.visibility = editing ? 'visible' : 'hidden';
		}
	}]);

	return RepoFileEditLink;
}();
'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/** @deprecated
 * We are using RepoFileEditorCM instead
 */
var mySettings = {
	onShiftEnter: { keepDefault: false, replaceWith: '<br />\n' },
	onCtrlEnter: { keepDefault: false, openWith: '\n<p>', closeWith: '</p>' },
	onTab: { keepDefault: false, replaceWith: '    ' },
	markupSet: [{ name: 'Bold', key: 'B', openWith: '(!(<strong>|!|<b>)!)', closeWith: '(!(</strong>|!|</b>)!)' }, { name: 'Italic', key: 'I', openWith: '(!(<em>|!|<i>)!)', closeWith: '(!(</em>|!|</i>)!)' }, { name: 'Stroke through', key: 'S', openWith: '<del>', closeWith: '</del>' }, { separator: '---------------' }, { name: 'Bulleted List', openWith: '    <li>', closeWith: '</li>', multiline: true, openBlockWith: '<ul>\n', closeBlockWith: '\n</ul>' }, { name: 'Numeric List', openWith: '    <li>', closeWith: '</li>', multiline: true, openBlockWith: '<ol>\n', closeBlockWith: '\n</ol>' }, { separator: '---------------' }, { name: 'Picture', key: 'P', replaceWith: '<img src="[![Source:!:http://]!]" alt="[![Alternative text]!]" />' }, { name: 'Link', key: 'L', openWith: '<a href="[![Link:!:http://]!]"(!( title="[![Title]!]")!)>', closeWith: '</a>', placeHolder: 'Your text to link...' }, { separator: '---------------' }, { name: 'Clean', className: 'clean', replaceWith: function replaceWith(markitup) {
			return markitup.selection.replace(/<(.*?)>/g, "");
		} }, { name: 'Preview', className: 'preview', call: 'preview' }]
};

/**
 * @deprecated
 * Use RepoFileEditorCM instead
 */

var RepoFileEditor = function () {
	function RepoFileEditor(parent) {
		var repo = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

		_classCallCheck(this, RepoFileEditor);

		alert('@deprecated: use RepoFileEditorCM instead');
		debugger;
		this.parent = parent;
		this.repo = repo;
		if (!repo) {
			this.repo = parent.getAttribute('ebw-repo');
		}

		var _DTemplate = DTemplate('RepoFileEditor_ace');

		var _DTemplate2 = _slicedToArray(_DTemplate, 2);

		this.el = _DTemplate2[0];
		this.$ = _DTemplate2[1];

		this.file = false;

		Eventify(this.el, {
			'save': function save(evt) {
				evt.preventDefault();
				var content = this.editor.getValue();
				this.file.SetText(this.editor.getValue());
				this.file.Save().then(function () {
					// this.$.save.disabled = true;
				}).catch(function (err) {
					EBW.Error(err);
				});
			},
			'undo': function undo(evt) {
				evt.preventDefault();
				if (confirm('Undo the changes you\'ve just made to ' + this.file.path + '?')) {
					var orig = this.file.Original();
					this.file.SetText(orig);
					this.setText(orig);
					this.file.SetText(this.file.Original());
				}
			},
			'delete': function _delete(evt) {
				var _this = this;

				evt.preventDefault();
				if (confirm('Are you sure you want to delete ' + this.file.path + '?')) {
					this.file.Delete().then(function (res) {
						_this.file = null;
						_this.setFile(null);
					}).catch(function (err) {
						EBW.Error(err);
					});
				}
			}
		}, this);

		this.editor = ace.edit(this.$.editor);
		this.editor.setTheme("ace/theme/twilight");
		this.editor.getSession().setMode("ace/mode/markdown");
		this.parent.appendChild(this.el);
		// this.editor.getSession().on('change', (evt)=>{
		// 	console.log(`editor-on-chance: justLoaded = ${this.justLoaded}`);
		// 	this.$.save.disabled = this.justLoaded;
		// 	this.justLoaded = false;
		// });
		sessionStorage.clear();
	}

	_createClass(RepoFileEditor, [{
		key: 'setText',
		value: function setText(text) {
			this.editor.setValue(new String(text));
		}
	}, {
		key: 'setFile',
		value: function setFile(file) {
			var _this2 = this;

			if (this.file) {
				if (this.file == file) {
					return; // Cannot set to the file we're currently editing
				}
				this.file.SetText(this.editor.getValue());
				this.file.SetEditing(false);
			}
			if (!file) {
				// @TODO Need to catch New Files here... ?
				this.setText('Please select a file to edit.');
				return;
			}
			file.GetText().then(function (t) {
				_this2.file = file;
				_this2.file.SetEditing(true);
				var _iteratorNormalCompletion = true;
				var _didIteratorError = false;
				var _iteratorError = undefined;

				try {
					for (var _iterator = document.querySelectorAll('[ebw-current-filename]')[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
						var e = _step.value;

						e.textContent = file.path;
					}
				} catch (err) {
					_didIteratorError = true;
					_iteratorError = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion && _iterator.return) {
							_iterator.return();
						}
					} finally {
						if (_didIteratorError) {
							throw _iteratorError;
						}
					}
				}

				_this2.setText(t);
			}).catch(function (err) {
				EBW.Error(err);
			});
		}
	}]);

	return RepoFileEditor;
}();

// document.addEventListener('DOMContentLoaded', function() {
// 	for (let e of document.querySelectorAll('[data-instance="RepoFileEditor"]')) {
// 		new RepoFileEditor(e);
// 	}
// });
'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var RepoFileEditorCM = function () {
	function RepoFileEditorCM(parent) {
		var repo = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

		_classCallCheck(this, RepoFileEditorCM);

		this.parent = parent;
		this.repo = repo;
		if (!repo) {
			this.repo = parent.getAttribute('ebw-repo');
		}

		var _DTemplate = DTemplate(EditorCodeMirror.Template());

		var _DTemplate2 = _slicedToArray(_DTemplate, 2);

		this.el = _DTemplate2[0];
		this.$ = _DTemplate2[1];

		this.file = false;

		Eventify(document.getElementById('editor-actions'), {
			'save': function save(evt) {
				console.log('SAVE button pressed');
				evt.preventDefault();
				this.file.SetText(this.editor.getValue());

				this.file.Save().then(function () {
					// this.$.save.disabled = true;
					EBW.Toast('Document saved.');
				}).catch(function (err) {
					EBW.Error(err);
				});
			},
			'undo': function undo(evt) {
				evt.preventDefault();
				if (confirm('Undo the changes you\'ve just made to ' + this.file.path + '?')) {
					var orig = this.file.Original();
					this.file.SetText(orig);
					this.setText(orig);
					this.file.SetText(this.file.Original());
				}
			},
			'delete': function _delete(evt) {
				var _this = this;

				evt.preventDefault();
				if (confirm('Are you sure you want to delete ' + this.file.path + '?')) {
					this.file.Delete().then(function (res) {
						_this.file = null;
						_this.setFile(null);
					}).catch(function (err) {
						EBW.Error(err);
					});
				}
			}
		}, this);

		this.editor = new EditorCodeMirror(this.$.editor);
		this.parent.appendChild(this.el);
		// this.editor.getSession().on('change', (evt)=>{
		// 	console.log(`editor-on-change: justLoaded = ${this.justLoaded}`);
		// 	this.$.save.disabled = this.justLoaded;
		// 	this.justLoaded = false;
		// });
		sessionStorage.clear();
	}

	_createClass(RepoFileEditorCM, [{
		key: 'setText',
		value: function setText(text) {
			this.editor.setValue(new String(text));
		}
	}, {
		key: 'setFile',
		value: function setFile(file) {
			var _this2 = this;

			if (this.file) {
				if (this.file == file) {
					return; // Cannot set to the file we're currently editing
				}
				this.file.SetText(this.editor.getValue());
				this.file.SetEditing(false);
			}
			if (!file) {
				// @TODO Need to catch New Files here... ?
				this.setText('Please select a file to edit.');
				return;
			}
			file.GetText().then(function (t) {
				_this2.file = file;
				_this2.file.SetEditing(true);
				var _iteratorNormalCompletion = true;
				var _didIteratorError = false;
				var _iteratorError = undefined;

				try {
					for (var _iterator = document.querySelectorAll('[ebw-current-filename]')[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
						var e = _step.value;

						e.textContent = file.path;
					}
				} catch (err) {
					_didIteratorError = true;
					_iteratorError = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion && _iterator.return) {
							_iterator.return();
						}
					} finally {
						if (_didIteratorError) {
							throw _iteratorError;
						}
					}
				}

				_this2.setText(t);
			}).catch(function (err) {
				EBW.Error(err);
			});
		}
	}]);

	return RepoFileEditorCM;
}();
"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var RepoFileList = function () {
	function RepoFileList(parent, repoOwner, repoName, editor) {
		var _this2 = this;

		_classCallCheck(this, RepoFileList);

		new AllFilesList(repoOwner, repoName, editor);
		if (!parent) {
			console.log("Created RepoFileList with null parent");
			return;
		}
		this.parent = parent;
		this.repoOwner = repoOwner;
		this.repoName = repoName;
		this.editor = editor;

		this.files = [];

		var _DTemplate = DTemplate("RepoFileList");

		var _DTemplate2 = _slicedToArray(_DTemplate, 2);

		this.el = _DTemplate2[0];
		this.$ = _DTemplate2[1];

		Eventify(this.el, {
			'click-new': function clickNew(evt) {
				var _this = this;

				evt.preventDefault();
				// TODO Convert this to EBW.Prompt
				EBW.Prompt("Enter new filename:").then(function (name) {
					if (!name) return;
					var file = new RepoFileModel(_this.repoOwner, _this.repoName, "book/text/" + name, { "newFile": true });
					_this.files.push(file);
					new RepoFileEditLink(_this.$.fileList, file, function (x, file) {
						_this.editor.setFile(file);
					});
					_this.editor.setFile(file);
				});
			}
		}, this);

		this.api = EBW.API();

		this.api.ListFiles(repoOwner, repoName, "^book/text/.*").then(this.api.flatten(function (files) {
			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = files[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var f = _step.value;

					var file = new RepoFileModel(repoOwner, repoName, f);
					_this2.files.push(file);
					new RepoFileEditLink(_this2.$.fileList, file, function (x, file) {
						_this2.editor.setFile(file);
					});
				}
			} catch (err) {
				_didIteratorError = true;
				_iteratorError = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion && _iterator.return) {
						_iterator.return();
					}
				} finally {
					if (_didIteratorError) {
						throw _iteratorError;
					}
				}
			}
		})).catch(function (err) {
			EBW.Error(err);
		});

		this.parent.appendChild(this.el);
	}

	_createClass(RepoFileList, [{
		key: "IsDirty",
		value: function IsDirty() {
			if (!this.files) {
				return false;
			}
			var _iteratorNormalCompletion2 = true;
			var _didIteratorError2 = false;
			var _iteratorError2 = undefined;

			try {
				for (var _iterator2 = this.files[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
					var f = _step2.value;

					if (f.IsDirty()) {
						return true;
					}
				}
			} catch (err) {
				_didIteratorError2 = true;
				_iteratorError2 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion2 && _iterator2.return) {
						_iterator2.return();
					}
				} finally {
					if (_didIteratorError2) {
						throw _iteratorError2;
					}
				}
			}

			return false;
		}
	}]);

	return RepoFileList;
}();

window.RepoFileList = RepoFileList;
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _repoFileModelCache = {};

/**
 * RepoFileModel provides a wrapper around a file on the
 * server and a local copy of the file stored in the browser's
 * sessionStorage.
 * The RepoFileModel class has Dirty and Editing signals
 * that can be mapped to be notified when the file is editing or
 * when the file contents on the browser are Dirty, and should be 
 * updated to the server.
 * The RepoFileModel _should_ be somehow static for all
 * repo-path combinations, but at present it isn't, and it also
 * has a dependency upon the fileList object, which isn't great - I'm 
 * not entirely sure why this dependency exists. 
 */

var RepoFileModel = function () {
	function RepoFileModel(repoOwner, repoName, path) {
		var args = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

		_classCallCheck(this, RepoFileModel);

		var cacheKey = repoOwner + '/' + repoName + ':/' + path;
		var fm = _repoFileModelCache[cacheKey];
		if (fm) {
			return fm;
		}
		this.repoOwner = repoOwner;
		this.repoName = repoName;
		this.path = path;
		this.DirtySignal = new signals.Signal();
		this.EditingSignal = new signals.Signal();
		this.args = args;
		_repoFileModelCache[cacheKey] = this;
		return this;
	}

	_createClass(RepoFileModel, [{
		key: 'SetEditing',
		value: function SetEditing(editing) {
			this.editing = editing;
			this.EditingSignal.dispatch(this, editing);
		}
	}, {
		key: 'IsEditing',
		value: function IsEditing() {
			return this.editing;
		}
	}, {
		key: 'IsDirty',
		value: function IsDirty() {
			var t = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

			if (this.args.newFile) {
				return true;
			}
			if (!t) {
				t = sessionStorage.getItem(this.storageKey);
			}
			var orig = sessionStorage.getItem(this.storageKey + '-original');
			return orig != t;
		}
	}, {
		key: 'Save',
		value: function Save() {
			var _this = this;

			var t = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

			if (!t) {
				t = sessionStorage.getItem(this.storageKey);
			}
			if (!this.IsDirty(t)) {
				return Promise.resolve(true);
			}
			return new Promise(function (resolve, reject) {
				EBW.API().UpdateFile(_this.repoOwner, _this.repoName, _this.path, t).then(function (res) {
					sessionStorage.setItem(_this.storageKey + '-original', t);
					_this.SetText(t);
					_this.args.newFile = false;
					resolve(true);
				}).catch(function (err) {
					EBW.Error(err);
					reject(err);
				});
			});
		}
	}, {
		key: 'GetText',
		value: function GetText() {
			var _this2 = this;

			var t = sessionStorage.getItem(this.storageKey);
			if (t) {
				return Promise.resolve(t);
			}
			if (this.args.newFile) {
				return Promise.resolve('');
			}

			return new Promise(function (resolve, reject) {
				EBW.API().GetFileString(_this2.repoOwner, _this2.repoName, _this2.path).then(function (res) {
					var text = res[0];
					sessionStorage.setItem(_this2.storageKey + '-original', text);
					resolve(text);
				}, function (err) {
					reject(err);
				});
			});
		}
	}, {
		key: 'SetText',
		value: function SetText(t) {
			sessionStorage.setItem(this.storageKey, t);
			this.DirtySignal.dispatch(this, this.IsDirty(t));
		}
	}, {
		key: 'Original',
		value: function Original() {
			if (this.args.newFile) {
				return '';
			}
			return sessionStorage.getItem(this.storageKey + '-original');
		}
	}, {
		key: 'storageKey',
		get: function get() {
			return this.repoOwner + '/' + this.repoName + ':' + this.path;
		}
	}]);

	return RepoFileModel;
}();
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var toast_instance = null;

var Toast = function () {
	function Toast() {
		var el = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

		_classCallCheck(this, Toast);

		console.log("new Toast: el = ", el);
		if (null == toast_instance) {
			toast_instance = this;
			if (!el) {
				el = document.createElement("div");
				document.body.appendChild(el);
			}
			toast_instance.parent = el;
			toast_instance.parent.classList.add("Toast");
		}
		return toast_instance;
	}

	_createClass(Toast, null, [{
		key: "Show",
		value: function Show(msg) {
			var T = new Toast();
			var div = document.createElement("div");
			div.innerHTML = msg;
			T.parent.appendChild(div);
			setTimeout(function () {
				div.remove();
			}, 4500);
			return div;
		}
	}]);

	return Toast;
}();

window.Toast = Toast;
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var joinIterators = function () {
	function joinIterators(iters) {
		_classCallCheck(this, joinIterators);

		this.iters = iters;
		this.i = 0;
	}

	_createClass(joinIterators, [{
		key: 'next',
		value: function next() {
			if (this.i == this.iters.length) {
				return { 'value': undefined, 'done': true };
			}
			var r = this.iters[this.i].next();
			if (!r.done) {
				return r;
			}
			this.i++;
			return this.next();
		}
	}, {
		key: Symbol.iterator,
		value: function value() {
			return this;
		}
	}]);

	return joinIterators;
}();

var querySelectorAllIterator = function () {
	function querySelectorAllIterator(qs) {
		_classCallCheck(this, querySelectorAllIterator);

		this.qs = qs;
		this.i = 0;
	}

	_createClass(querySelectorAllIterator, [{
		key: 'next',
		value: function next() {
			if (this.i == this.qs.length) {
				return { 'value': undefined, 'done': true };
			}
			return { 'value': this.qs.item(this.i++), 'done': false };
		}
	}, {
		key: Symbol.iterator,
		value: function value() {
			return this;
		}
	}]);

	return querySelectorAllIterator;
}();

var QuerySelectorAllIterate = function QuerySelectorAllIterate(el, query) {
	var els = [];
	if ('function' == typeof el.matches) {
		if (el.matches(query)) {
			els.push(el);
		}
	} else if ('function' == typeof el.matchesSelector) {
		if (el.matchesSelector(query)) {
			els.push(el);
		}
	}
	var qs = el.querySelectorAll(query);
	var i = qs[Symbol.iterator];
	if ('function' == typeof i) {
		return new joinIterators([els[Symbol.iterator](), qs[Symbol.iterator]()]);
	}
	return new joinIterators([els[Symbol.iterator](), new querySelectorAllIterator(qs)]);
};
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Directory models a directory on the server. It needs to know
 * its own directory name, and the link to its parent so that it
 * can construct its full name on the parent.
 */
var Directory = function () {
	function Directory(parent, name) {
		_classCallCheck(this, Directory);

		this._parent = parent;
		this._name = name;
		this.Files = [];
	}

	_createClass(Directory, [{
		key: 'Debug',
		value: function Debug() {
			console.log(this.path);
			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = this.Files[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var f = _step.value;

					f.Debug();
				}
			} catch (err) {
				_didIteratorError = true;
				_iteratorError = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion && _iterator.return) {
						_iterator.return();
					}
				} finally {
					if (_didIteratorError) {
						throw _iteratorError;
					}
				}
			}
		}
	}, {
		key: 'FileNamesOnly',
		value: regeneratorRuntime.mark(function FileNamesOnly() {
			var _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, f;

			return regeneratorRuntime.wrap(function FileNamesOnly$(_context) {
				while (1) {
					switch (_context.prev = _context.next) {
						case 0:
							_iteratorNormalCompletion2 = true;
							_didIteratorError2 = false;
							_iteratorError2 = undefined;
							_context.prev = 3;
							_iterator2 = this.Files[Symbol.iterator]();

						case 5:
							if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
								_context.next = 16;
								break;
							}

							f = _step2.value;

							if (f.isFile) {
								_context.next = 11;
								break;
							}

							return _context.delegateYield(f.FileNamesOnly(), 't0', 9);

						case 9:
							_context.next = 13;
							break;

						case 11:
							_context.next = 13;
							return f.path;

						case 13:
							_iteratorNormalCompletion2 = true;
							_context.next = 5;
							break;

						case 16:
							_context.next = 22;
							break;

						case 18:
							_context.prev = 18;
							_context.t1 = _context['catch'](3);
							_didIteratorError2 = true;
							_iteratorError2 = _context.t1;

						case 22:
							_context.prev = 22;
							_context.prev = 23;

							if (!_iteratorNormalCompletion2 && _iterator2.return) {
								_iterator2.return();
							}

						case 25:
							_context.prev = 25;

							if (!_didIteratorError2) {
								_context.next = 28;
								break;
							}

							throw _iteratorError2;

						case 28:
							return _context.finish(25);

						case 29:
							return _context.finish(22);

						case 30:
						case 'end':
							return _context.stop();
					}
				}
			}, FileNamesOnly, this, [[3, 18, 22, 30], [23,, 25, 29]]);
		})
	}, {
		key: 'path',
		get: function get() {
			if (this._parent) {
				return this._parent.path + this.name + '/';
			}
			return '';
		}
	}, {
		key: 'name',
		get: function get() {
			return this._name;
		}
	}, {
		key: 'isFile',
		get: function get() {
			return false;
		}
	}], [{
		key: 'FromJS',
		value: function FromJS(parent, js) {
			var d = new Directory(parent, js.Name);
			var _iteratorNormalCompletion3 = true;
			var _didIteratorError3 = false;
			var _iteratorError3 = undefined;

			try {
				for (var _iterator3 = js.Files[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
					var f = _step3.value;

					var e = null;
					if (f.Dir) {
						e = Directory.FromJS(d, f);
						d.Files.push(e);
					} else {
						e = File.FromJS(d, f);
						d.Files.push(e);
					}
				}
			} catch (err) {
				_didIteratorError3 = true;
				_iteratorError3 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion3 && _iterator3.return) {
						_iterator3.return();
					}
				} finally {
					if (_didIteratorError3) {
						throw _iteratorError3;
					}
				}
			}

			return d;
		}
	}]);

	return Directory;
}();
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * File models a File on the server.
 */
var File = function () {
	function File(parent, name) {
		_classCallCheck(this, File);

		this._parent = parent;
		this._name = name;
	}

	_createClass(File, [{
		key: "Debug",
		value: function Debug() {
			console.log(this.path);
		}
	}, {
		key: "path",
		get: function get() {
			var p = this._parent ? this._parent.path : "";
			return p + this._name;
		}
	}, {
		key: "isFile",
		get: function get() {
			return true;
		}
	}, {
		key: "name",
		get: function get() {
			return this._name;
		}
	}], [{
		key: "FromJS",
		value: function FromJS(parent, js) {
			return new File(parent, js.Name);
		}
	}]);

	return File;
}();