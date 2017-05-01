(function (exports,tslib_1) {
'use strict';

var APIWs = (function () {
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
            _this.live["delete"](id);
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
        };
        this.ws.onopen = function (evt) {
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
            _this.live.set(id, [resolve, reject]);
            if (1 == _this.ws.readyState) {
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
    APIWs.prototype.DeleteFile = function (repoOwner, repoName, path) {
        return this.rpc("DeleteFile", [repoOwner, repoName, path]);
    };
    APIWs.prototype.ListFiles = function (repoOwner, repoName, pathregex) {
        return this.rpc("ListFiles", [repoOwner, repoName, pathregex]);
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
    APIWs.prototype.ListPullRequests = function (repoOwner, repoName) {
        return this.rpc("ListPullRequests", [repoOwner, repoName]);
    };
    APIWs.prototype.PullRequestDiffList = function (repoOwner, repoName, sha, regexp) {
        return this.rpc("PullRequestDiffList", [repoOwner, repoName, sha, regexp]);
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
    APIWs.prototype.PrintPdfEndpoint = function (repoOwner, repoName, book) {
        return this.rpc("PrintPdfEndpoint", [repoOwner, repoName, book]);
    };
    return APIWs;
}());

var Toast = (function () {
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

var AddNewBookDialog$1 = (function () {
    function AddNewBookDialog() {
        var t = AddNewBookDialog._template;
        if (!t) {
            var d = document.createElement('div');
            d.innerHTML = "<div>\n\t<div>\n\t\t<h1>Add a New Book</h1>\n\t\t<fieldset>\n\t\t\t<label>\n\t\t\t\t<input type=\"radio\" value=\"new\"/>\n\t\t\t\tStart an new book.\n\t\t\t</label>\n\t\t\t<label>\n\t\t\t\t<input type=\"radio\" value=\"collaborate\"/>\n\t\t\t\tCollaborate on an existing book.\n\t\t\t</label>\n\t\t</fieldset>\n\t\t<button data-event=\"click:choseType\" class=\"btn\">Next</button>\n\t</div>\n\t<div style=\"display: none;\">\n\t\t<h1>New Book</h1>\n\t\t<form method=\"post\" action=\"/github/create/new\">\n\t\t<input type=\"hidden\" name=\"action\" value=\"new\"/>\n\t\t<label>Enter the name for your new book.\n\t\t<input type=\"text\" name=\"repo_new\" placeholder=\"e.g. MobyDick\"/>\n\t\t</label>\n\t\t<input type=\"submit\" class=\"btn\" value=\"New Book\"/>\n\t\t</form>\n\t</div>\n\t<div>\n\t\t<h1>Collaborate</h1>\n\t\t<form method=\"post\" action=\"/github/create/fork\">\n\t\t<input type=\"hidden\" name=\"action\" value=\"fork\"/>\n\t\t<label>Enter the owner and repo for the book you will collaborate on.\n\t\t<input type=\"text\" name=\"collaborate_repo\" placeholder=\"e.g. electricbooks/core\"/>\n\t\t</label>\n\t\t<input type=\"submit\" class=\"btn\" value=\"Collaborate\"/>\n\t\t</form>\n\t</div>\n</div>";
            t = d.firstElementChild;
            AddNewBookDialog._template = t;
        }
        var n = t.cloneNode(true);
        this.$ = {
            chooseType: n.childNodes[1],
            newBookRadio: n.childNodes[1].childNodes[3].childNodes[1].childNodes[1],
            collaborateRadio: n.childNodes[1].childNodes[3].childNodes[3].childNodes[1],
            newBook: n.childNodes[3],
            repo_name: n.childNodes[3].childNodes[3].childNodes[3].childNodes[1],
            collaborate: n.childNodes[5],
            collaborate_repo: n.childNodes[5].childNodes[3].childNodes[3].childNodes[1]
        };
        this.el = n;
    }
    return AddNewBookDialog;
}());
var AllFiles_File = (function () {
    function AllFiles_File() {
        var t = AllFiles_File._template;
        if (!t) {
            var d = document.createElement('div');
            d.innerHTML = "<ul>\n\t<li data-set=\"this\" class=\"allfiles-file\">\n\t\t<div data-event=\"click:clickName\">NAME\n\t\t</div>\n\t</li>\n</ul>";
            t = d.firstElementChild.childNodes[1];
            AllFiles_File._template = t;
        }
        var n = t.cloneNode(true);
        this.$ = {
            name: n.childNodes[1]
        };
        this.el = n;
    }
    return AllFiles_File;
}());
var RepoFileEditor_codemirror = (function () {
    function RepoFileEditor_codemirror() {
        var t = RepoFileEditor_codemirror._template;
        if (!t) {
            var d = document.createElement('div');
            d.innerHTML = "<div class=\"repo-file-editor-workspace\">\n\t<div class=\"repo-file-editor\">\n\t</div>\n</div>";
            t = d.firstElementChild;
            RepoFileEditor_codemirror._template = t;
        }
        var n = t.cloneNode(true);
        this.$ = {
            editor: n.childNodes[1]
        };
        this.el = n;
    }
    return RepoFileEditor_codemirror;
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
//# sourceMappingURL=querySelectorAll-extensions.js.map

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
//# sourceMappingURL=Eventify.js.map

var AddNewBookDialog$$1 = (function (_super) {
    tslib_1.__extends(AddNewBookDialog$$1, _super);
    function AddNewBookDialog$$1(parent) {
        var _this = _super.call(this) || this;
        Eventify(_this.el, {
            'choseType': function () {
                var newBook = _this.$.newBookRadio.checked;
                var collaborate = _this.$.collaborateRadio.checked;
                if (!newBook && !collaborate) {
                    alert("You need to choose one or the other");
                    return;
                }
                if (newBook) {
                    _this.$.newBook.style.display = 'block';
                    _this.$.repo_name.focus();
                }
                else {
                    _this.$.collaborate.style.display = 'block';
                    _this.$.collaborate_repo.focus();
                }
                _this.$.chooseType.style.display = 'none';
            }
        });
        $(parent).bind("open.zf.reveal", function (evt) {
            _this.$.chooseType.style.display = 'block';
            _this.$.newBookRadio.checked = false;
            _this.$.collaborateRadio.checked = false;
            _this.$.newBook.style.display = 'none';
            _this.$.repo_name.value = '';
            _this.$.collaborate.style.display = 'none';
            _this.$.collaborate_repo.value = '';
        });
        parent.appendChild(_this.el);
        return _this;
    }
    AddNewBookDialog$$1.instantiate = function () {
        document.querySelectorAll("[data-instance='AddNewBookDialog']").forEach(function (el) {
            console.log("qsa.forEach(", el, ")");
            new AddNewBookDialog$$1(el);
        });
    };
    return AddNewBookDialog$$1;
}(AddNewBookDialog$1));

var File = (function () {
    function File(parent, name) {
        this._parent = parent;
        this._name = name;
    }
    File.FromJS = function (parent, js) {
        return new File(parent, js.Name);
    };
    File.prototype.Debug = function () {
        console.log(this.path());
    };
    File.prototype.Path = function () {
        var p = this._parent ? this._parent.Path() : "";
        return p + this._name;
    };
    File.prototype.IsFile = function () {
        return true;
    };
    File.prototype.Name = function () {
        return this._name;
    };
    return File;
}());

var Directory = (function () {
    function Directory(parent, name) {
        this._parent = parent;
        this._name = name;
        this.Files = [];
    }
    Directory.FromJS = function (parent, js) {
        var d = new Directory(parent, js.Name);
        for (var _i = 0, _a = js.Files; _i < _a.length; _i++) {
            var f = _a[_i];
            var e = void 0;
            if (f.Dir) {
                e = Directory.FromJS(d, f);
                d.Files.push(e);
            }
            else {
                e = File.FromJS(d, f);
                d.Files.push(e);
            }
        }
        return d;
    };
    Directory.prototype.Debug = function () {
        console.log(this.Path());
        for (var _i = 0, _a = this.Files; _i < _a.length; _i++) {
            var f = _a[_i];
            f.Debug();
        }
    };
    Directory.prototype.Path = function () {
        if (this._parent) {
            return this._parent.Path() + this._name + '/';
        }
        return '';
    };
    Directory.prototype.Name = function () {
        return this._name;
    };
    Directory.prototype.IsFile = function () {
        return false;
    };
    Directory.prototype.FileNamesOnly = function (filter) {
        var fs = [];
        for (var _i = 0, _a = this.Files; _i < _a.length; _i++) {
            var f = _a[_i];
            if (f.IsFile()) {
                var p = f.Path();
                if (!filter || filter(p)) {
                    fs.push(p);
                }
            }
            else {
                fs = fs.concat(f.FileNamesOnly(filter));
            }
        }
        return fs.sort();
    };
    return Directory;
}());

var FileState;
(function (FileState) {
    FileState[FileState["Exists"] = 1] = "Exists";
    FileState[FileState["Changed"] = 2] = "Changed";
    FileState[FileState["Removed"] = 4] = "Removed";
})(FileState || (FileState = {}));

var FileInfo = (function () {
    function FileInfo(name, state) {
        this.name = name;
        this.state = state;
        this.Listener = new signals.Signal();
    }
    FileInfo.prototype.SetState = function (s) {
        this.State = s;
        this.Listener.despatch(this);
    };
    FileInfo.prototype.State = function () {
        return this.state;
    };
    FileInfo.prototype.Name = function () {
        return this.name;
    };
    return FileInfo;
}());

var Volume = (function () {
    function Volume() {
        this.files = new Map();
        this.Events = new signals.Signal();
    }
    Volume.prototype.Write = function (path) {
        if (this.files.has(path)) {
            var fi_1 = this.files.get(path);
            fi_1.SetState(FileState.Changed);
            return;
        }
        var fi = new FileInfo(path, FileState.Changed);
        this.files.set(path, fi);
    };
    Volume.prototype.Remove = function (path) {
        if (!this.files.has(path)) {
            return;
        }
        var fi = this.files.get(path);
        fi.SetState(FileState.Removed);
    };
    Volume.prototype.FromJS = function (js) {
        var d = Directory.FromJS(undefined, js);
        this.files = new Map();
        var filter = function (n) {
            if ("." == n.substr(0, 1)) {
                return false;
            }
            if ("_output" == n.substr(0, 7)) {
                return false;
            }
            if ("_html" == n.substr(0, 5)) {
                return false;
            }
            return true;
        };
        for (var _i = 0, _a = d.FileNamesOnly(filter); _i < _a.length; _i++) {
            var f = _a[_i];
            var fi = new FileInfo(f, FileState.Exists);
            this.files.set(f, fi);
            this.Events.dispatch(this, fi);
        }
    };
    return Volume;
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
//# sourceMappingURL=DOM.js.map

var AllFiles_File$1 = (function (_super) {
    tslib_1.__extends(AllFiles_File$$1, _super);
    function AllFiles_File$$1(parent, fileInfo, events) {
        var _this = _super.call(this) || this;
        _this.fileInfo = fileInfo;
        _this.$.name.textContent = fileInfo.Name();
        Eventify(_this.el, events);
        AddToParent(parent, _this.el);
        return _this;
    }
    return AllFiles_File$$1;
}(AllFiles_File));

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
var RepoFileModel = (function () {
    function RepoFileModel(repoOwner, repoName, path, options) {
        if (options === void 0) { options = {}; }
        this.repoOwner = repoOwner;
        this.repoName = repoName;
        this.path = path;
        this.options = options;
        var cacheKey = repoOwner + "/" + repoName + ":/" + path;
        var fm = _repoFileModelCache[cacheKey];
        if (fm) {
            return fm;
        }
        this.DirtySignal = new signals.Signal();
        this.EditingSignal = new signals.Signal();
        _repoFileModelCache[cacheKey] = this;
        return this;
    }
    RepoFileModel.prototype.Path = function () {
        return this.path;
    };
    RepoFileModel.prototype.storageKey = function () {
        return this.repoOwner + "/" + this.repoName + ":" + this.path;
    };
    RepoFileModel.prototype.SetEditing = function (editing) {
        this.editing = editing;
        this.EditingSignal.dispatch(this, editing);
    };
    RepoFileModel.prototype.IsEditing = function () {
        return this.editing;
    };
    RepoFileModel.prototype.IsDirty = function (t) {
        if (t === void 0) { t = false; }
        if (this.options.newFile) {
            return true;
        }
        if (!t) {
            t = sessionStorage.getItem(this.storageKey());
        }
        var orig = sessionStorage.getItem(this.storageKey() + '-original');
        return (orig != t);
    };
    RepoFileModel.prototype.Save = function (t) {
        var _this = this;
        if (t === void 0) { t = false; }
        if (!t) {
            t = sessionStorage.getItem(this.storageKey());
        }
        if (!this.IsDirty(t)) {
            return Promise.resolve(true);
        }
        return new Promise(function (resolve, reject) {
            EBW.API().UpdateFile(_this.repoOwner, _this.repoName, _this.path, t).then(function (res) {
                sessionStorage.setItem(_this.storageKey + '-original', t);
                _this.SetText(t);
                _this.options.newFile = false;
                resolve(true);
            })["catch"](function (err) {
                EBW.Error(err);
                reject(err);
            });
        });
    };
    RepoFileModel.prototype.GetText = function () {
        var _this = this;
        var t = sessionStorage.getItem(this.storageKey());
        if (t) {
            return Promise.resolve(t);
        }
        if (this.options.newFile) {
            return Promise.resolve('');
        }
        return new Promise(function (resolve, reject) {
            EBW.API().GetFileString(_this.repoOwner, _this.repoName, _this.path).then(function (_a) {
                var text = _a[0];
                sessionStorage.setItem(_this.storageKey() + '-original', text);
                resolve(text);
            }, function (err) {
                reject(err);
            });
        });
    };
    RepoFileModel.prototype.SetText = function (t) {
        sessionStorage.setItem(this.storageKey(), t);
        this.DirtySignal.dispatch(this, this.IsDirty(t));
    };
    RepoFileModel.prototype.Original = function () {
        if (this.options.newFile) {
            return '';
        }
        return sessionStorage.getItem(this.storageKey() + '-original');
    };
    return RepoFileModel;
}());

// import {Directory} from './Directory';
var AllFilesList = (function () {
    function AllFilesList(parent, repoOwner, repoName, editor) {
        var _this = this;
        this.parent = parent;
        this.repoOwner = repoOwner;
        this.repoName = repoName;
        this.editor = editor;
        this.api = EBW.API();
        if ("" == this.repoOwner) {
            this.repoOwner = parent.getAttribute("repo-owner");
        }
        if ("" == this.repoName) {
            this.repoName = parent.getAttribute("repo-name");
        }
        if (parent.hasAttribute("data-files")) {
            this.renderFilesList(JSON.parse(parent.getAttribute("data-files")));
        }
        else {
            this.api.ListAllRepoFiles(this.repoOwner, this.repoName)
                .then(function (_a) {
                var js = _a[0];
                _this.renderFilesList(js);
            })["catch"](EBW.Error);
        }
    }
    AllFilesList.prototype.renderFilesList = function (js) {
        var v = new Volume();
        v.Events.add(this.volumeChange, this);
        v.FromJS(js);
        // new AllFilesEditor(
        // 	this.repoOwner, this.repoName,
        // 	document.getElementById(`all-files-editor`),
        // 	d, 
        // 	(_source, file)=>{
        // 		this.editor.setFile(file);
        // });
    };
    AllFilesList.prototype.volumeChange = function (volume, fileInfo) {
        var _this = this;
        new AllFiles_File$1(this.parent, fileInfo, {
            clickName: function (evt) {
                console.log("clicked " + fileInfo.Name());
                var m = new RepoFileModel(_this.repoOwner, _this.repoName, fileInfo.Name());
                _this.editor.setFile(m);
            }
        });
    };
    return AllFilesList;
}());

var PrintListener = (function () {
    function PrintListener(repoOwner, repoName, book) {
        if (book === void 0) { book = "book"; }
        var _this = this;
        this.repoOwner = repoOwner;
        this.repoName = repoName;
        this.book = book;
        if ("" == this.book) {
            this.book = "book";
        }
        EBW.API().PrintPdfEndpoint(repoOwner, repoName, book).then(function (_a) {
            var url = _a[0];
            _this.startListener(url);
        })["catch"](EBW.Error);
    }
    PrintListener.prototype.startListener = function (key) {
        var _this = this;
        var url = document.location.protocol +
            "//" +
            document.location.host + "/print/sse/" + key;
        var sse = new EventSource(url);
        sse.addEventListener("open", function () {
        });
        sse.addEventListener('tick', function (e) {
            console.log("tick received: ", e);
        });
        sse.addEventListener("info", function (e) {
            // console.log(`INFO on printListener: `, e.data);
            var data = JSON.parse(e.data);
            EBW.Toast("Printing: ", e.data);
        });
        sse.addEventListener("error", function (e) {
            var err = JSON.parse(e.data);
            EBW.Error(err);
            sse.close();
        });
        sse.addEventListener("output", function (e) {
            var data = JSON.parse(e.data);
            var url = document.location.protocol +
                "//" +
                document.location.host +
                ("/www/" + _this.repoOwner + "/" + _this.repoName + "/" + data);
            EBW.Toast("Your PDF is ready: opening in a new window.");
            window.open(url, _this.repoOwner + "-" + _this.repoName + "-pdf");
        });
        sse.addEventListener("done", function (e) {
            sse.close();
        });
        sse.onmessage = function (e) {
            _this.onmessage(e);
        };
        sse.onerror = EBW.Error;
    };
    PrintListener.prototype.onmessage = function (e) {
        console.log("PrintListener.onmessage: ", e);
    };
    return PrintListener;
}());

var EditorCodeMirror = (function () {
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
    return EditorCodeMirror;
}());

var RepoFileEditorCM = (function (_super) {
    tslib_1.__extends(RepoFileEditorCM, _super);
    function RepoFileEditorCM(parent) {
        var _this = _super.call(this) || this;
        _this.parent = parent;
        _this.file = false;
        Eventify(document.getElementById('editor-actions'), {
            'save': function (evt) {
                evt.preventDefault();
                _this.file.SetText(_this.editor.getValue());
                _this.file.Save()
                    .then(function () {
                    // this.$.save.disabled = true;
                    EBW.Toast("Document saved.");
                })["catch"](function (err) {
                    console.error(err);
                    EBW.Error(err);
                });
            },
            'undo': function (evt) {
                evt.preventDefault();
                if (confirm("Undo the changes you've just made to " + _this.file.Path() + "?")) {
                    var orig = _this.file.Original();
                    _this.file.SetText(orig);
                    _this.setText(orig);
                    _this.file.SetText(_this.file.Original());
                }
            },
            'delete': function (evt) {
                evt.preventDefault();
                if (confirm("Are you sure you want to delete " + _this.file.Path() + "?")) {
                    _this.file.Delete()
                        .then(function (res) {
                        _this.file = null;
                        _this.setFile(null);
                    })["catch"](function (err) {
                        EBW.Error(err);
                    });
                }
            }
        });
        _this.editor = new EditorCodeMirror(_this.$.editor);
        _this.parent.appendChild(_this.el);
        // this.editor.getSession().on('change', (evt)=>{
        // 	console.log(`editor-on-change: justLoaded = ${this.justLoaded}`);
        // 	this.$.save.disabled = this.justLoaded;
        // 	this.justLoaded = false;
        // });
        sessionStorage.clear();
        return _this;
    }
    RepoFileEditorCM.prototype.setText = function (text) {
        this.editor.setValue(new String(text));
    };
    RepoFileEditorCM.prototype.setFile = function (file) {
        var _this = this;
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
        file.GetText()
            .then(function (t) {
            _this.file = file;
            _this.file.SetEditing(true);
            for (var _i = 0, _a = document.querySelectorAll('[ebw-current-filename]'); _i < _a.length; _i++) {
                var e = _a[_i];
                e.textContent = file.path;
            }
            _this.setText(t);
        })["catch"](function (err) {
            EBW.Error(err);
        });
    };
    return RepoFileEditorCM;
}(RepoFileEditor_codemirror));

var RepoEditorPage = (function () {
    function RepoEditorPage(repoOwner, repoName, allFilesListEl) {
        var _this = this;
        this.repoOwner = repoOwner;
        this.repoName = repoName;
        this.repoOwner = repoOwner;
        this.repoName = repoName;
        this.editor = new RepoFileEditorCM(document.getElementById('editor'));
        new AllFilesList(allFilesListEl, repoOwner, repoName, this.editor);
        //new PullRequestList(document.getElementById('pull-request-list'), repo);
        // window.addEventListener('beforeunload', evt=> {
        // 	// transfer editor to file text
        // 	this.editor.setFile(null);
        // 	if (this.files.IsDirty()) {
        // 		evt.returnValue='confirm';
        // 		evt.stopPropagation();
        // 	}
        // });
        document.getElementById("repo-print").addEventListener('click', function (evt) {
            evt.preventDefault();
            evt.stopPropagation();
            console.log("Starting printing...");
            EBW.Toast("Printing in progress...");
            new PrintListener(_this.repoOwner, _this.repoName, "book");
        });
        document.getElementById("repo-jekyll").addEventListener("click", function (evt) {
            evt.preventDefault();
            evt.stopPropagation();
            var l = document.location;
            var jekyllUrl = l.protocol + "//" + l.host + "/jekyll/" + _this.repoOwner + "/" + _this.repoName + "/";
            console.log("URL = " + jekyllUrl);
            window.open(jekyllUrl, _this.repoOwner + "-" + _this.repoName + "-jekyll");
        });
    }
    RepoEditorPage.instantiate = function () {
        var el = document.querySelector("[data-instance=\"RepoEditorPage\"]");
        if (el) {
            console.log("Instnatiating RepoEditorPage");
            var repoOwner = el.getAttribute('repo-owner');
            var repoName = el.getAttribute('repo-name');
            var allFilesList = document.querySelector("[data-instace='AllFilesList']");
            new RepoEditorPage(repoOwner, repoName, document.querySelector("[data-instance='AllFilesList']"));
        }
    };
    return RepoEditorPage;
}());

var EBW = (function () {
    function EBW() {
        if (null == EBW.instance) {
            EBW.instance = this;
            this.api = new APIWs();
            jQuery(document).foundation();
            AddNewBookDialog$$1.instantiate();
            RepoEditorPage.instantiate();
        }
        return EBW.instance;
    }
    EBW.API = function () {
        var ebw = new EBW();
        return ebw.api;
    };
    EBW.Error = function (err) {
        console.error('ERROR: ', err);
        debugger;
        alert(err);
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
        return Promise.resolve("" == r ? false : r);
    };
    return EBW;
}());
document.addEventListener('DOMContentLoaded', function () {
    new EBW();
});

exports.EBW = EBW;

}((this.EBW = this.EBW || {}),tslib));
//# sourceMappingURL=ts.js.map
