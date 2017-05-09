(function (exports,tslib_1,TSFoundation) {
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
            d.innerHTML = "<div><div><h1>Add a New Book</h1><fieldset><label><input type=\"radio\" value=\"new\"/>\n\t\t\t\tStart a new book.\n\t\t\t</label><label><input type=\"radio\" value=\"collaborate\"/>\n\t\t\t\tCollaborate on an existing book.\n\t\t\t</label></fieldset><button data-event=\"click:choseType\" class=\"btn\">Next</button></div><div><h1>New Book</h1><form method=\"post\" action=\"/github/create/new\"><input type=\"hidden\" name=\"action\" value=\"new\"/><label>Enter the name for your new book.\n\t\t<input type=\"text\" name=\"repo_new\" placeholder=\"e.g. MobyDick\"/>\n\t\t</label><input type=\"submit\" class=\"btn\" value=\"New Book\"/></form></div><div><h1>Collaborate</h1><form method=\"post\" action=\"/github/create/fork\"><input type=\"hidden\" name=\"action\" value=\"fork\"/><label>Enter the owner and repo for the book you will collaborate on.\n\t\t<input type=\"text\" name=\"collaborate_repo\" placeholder=\"e.g. electricbooks/core\"/>\n\t\t</label><input type=\"submit\" class=\"btn\" value=\"Collaborate\"/></form></div></div>";
            t = d.firstElementChild;
            AddNewBookDialog._template = t;
        }
        var n = t.cloneNode(true);
        this.$ = {
            chooseType: n.childNodes[0],
            newBookRadio: n.childNodes[0].childNodes[1].childNodes[0].childNodes[0],
            collaborateRadio: n.childNodes[0].childNodes[1].childNodes[1].childNodes[0],
            newBook: n.childNodes[1],
            repo_name: n.childNodes[1].childNodes[1].childNodes[1].childNodes[1],
            collaborate: n.childNodes[2],
            collaborate_repo: n.childNodes[2].childNodes[1].childNodes[1].childNodes[1],
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
            d.innerHTML = "<ul><li data-set=\"this\" class=\"allfiles-file\"><div data-event=\"click:clickName\">NAME\n\t\t</div></li></ul>";
            t = d.firstElementChild.childNodes[0];
            AllFiles_File._template = t;
        }
        var n = t.cloneNode(true);
        this.$ = {
            name: n.childNodes[0],
        };
        this.el = n;
    }
    return AllFiles_File;
}());
var FSFileList_File = (function () {
    function FSFileList_File() {
        var t = FSFileList_File._template;
        if (!t) {
            var d = document.createElement('div');
            d.innerHTML = "<ul><li data-set=\"this\" class=\"allfiles-file\"><div data-event=\"click:clickFile\">NAME\n\t\t</div></li></ul>";
            t = d.firstElementChild.childNodes[0];
            FSFileList_File._template = t;
        }
        var n = t.cloneNode(true);
        this.$ = {
            name: n.childNodes[0],
        };
        this.el = n;
    }
    return FSFileList_File;
}());
var FoundationRevealDialog = (function () {
    function FoundationRevealDialog() {
        var t = FoundationRevealDialog._template;
        if (!t) {
            var d = document.createElement('div');
            d.innerHTML = "<div class=\"reveal\" id=\"new-file-dialog\" data-reveal=\"\"><div class=\"content\">\n\t</div><button class=\"close-button\" aria-label=\"Close popup\" type=\"button\" data-close=\"\"><span aria-hidden=\"true\">\u00D7</span></button></div>";
            t = d.firstElementChild;
            FoundationRevealDialog._template = t;
        }
        var n = t.cloneNode(true);
        this.$ = {
            content: n.childNodes[0],
        };
        this.el = n;
    }
    return FoundationRevealDialog;
}());
var MergeEditor = (function () {
    function MergeEditor() {
        var t = MergeEditor._template;
        if (!t) {
            var d = document.createElement('div');
            d.innerHTML = "<div class=\"merge-editor\"><div class=\"action-group\"><button data-event=\"click:save\" class=\"btn\">Save</button></div><div class=\"merge-mergely\">\n\t</div></div>";
            t = d.firstElementChild;
            MergeEditor._template = t;
        }
        var n = t.cloneNode(true);
        this.$ = {
            mergely: n.childNodes[1],
        };
        this.el = n;
    }
    return MergeEditor;
}());
var PullRequestDiffList_File = (function () {
    function PullRequestDiffList_File() {
        var t = PullRequestDiffList_File._template;
        if (!t) {
            var d = document.createElement('div');
            d.innerHTML = "<ul><li data-set=\"this\">\n\t</li></ul>";
            t = d.firstElementChild.childNodes[0];
            PullRequestDiffList_File._template = t;
        }
        var n = t.cloneNode(true);
        this.$ = {};
        this.el = n;
    }
    return PullRequestDiffList_File;
}());
var RepoEditorPage_NewFileDialog = (function () {
    function RepoEditorPage_NewFileDialog() {
        var t = RepoEditorPage_NewFileDialog._template;
        if (!t) {
            var d = document.createElement('div');
            d.innerHTML = "<div><fieldset><label>\n\t\t\tEnter the full path to your new file.\n\t\t\t<input type=\"text\" placeholder=\"/book/text/chapter-7.md\" data-event=\"change\"/>\n\t\t</label></fieldset><button class=\"btn\" data-event=\"click\">Create File</button></div>";
            t = d.firstElementChild;
            RepoEditorPage_NewFileDialog._template = t;
        }
        var n = t.cloneNode(true);
        this.$ = {
            filename: n.childNodes[0].childNodes[0].childNodes[1],
        };
        this.el = n;
    }
    return RepoEditorPage_NewFileDialog;
}());
var RepoEditorPage_RenameFileDialog = (function () {
    function RepoEditorPage_RenameFileDialog() {
        var t = RepoEditorPage_RenameFileDialog._template;
        if (!t) {
            var d = document.createElement('div');
            d.innerHTML = "<div><div class=\"error\">\n\t</div><fieldset><div>Renaming <span> </span></div><label>\n\t\t\tEnter the full path to your new file.\n\t\t\t<input type=\"text\" placeholder=\"/book/text/chapter-7.md\" data-event=\"change\"/>\n\t\t</label></fieldset><button class=\"btn\" data-event=\"click\">Rename</button></div>";
            t = d.firstElementChild;
            RepoEditorPage_RenameFileDialog._template = t;
        }
        var n = t.cloneNode(true);
        this.$ = {
            error: n.childNodes[0],
            current_name: n.childNodes[1].childNodes[0].childNodes[1],
            filename: n.childNodes[1].childNodes[1].childNodes[1],
        };
        this.el = n;
    }
    return RepoEditorPage_RenameFileDialog;
}());
var RepoFileEditor_codemirror = (function () {
    function RepoFileEditor_codemirror() {
        var t = RepoFileEditor_codemirror._template;
        if (!t) {
            var d = document.createElement('div');
            d.innerHTML = "<div class=\"repo-file-editor-workspace\"><div class=\"repo-file-editor\">\n\t</div></div>";
            t = d.firstElementChild;
            RepoFileEditor_codemirror._template = t;
        }
        var n = t.cloneNode(true);
        this.$ = {
            editor: n.childNodes[0],
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
        var list = document.querySelectorAll("[data-instance='AddNewBookDialog']");
        for (var i = 0; i < list.length; i++) {
            var el = list.item(i);
            console.log("qsa.forEach(", el, ")");
            new AddNewBookDialog$$1(el);
        }
    };
    return AddNewBookDialog$$1;
}(AddNewBookDialog$1));

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
        })
            .catch(EBW.Error);
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
    function RepoFileEditorCM(parent, callbacks) {
        var _this = _super.call(this) || this;
        _this.parent = parent;
        _this.callbacks = callbacks;
        Eventify(document.getElementById('editor-actions'), {
            'save': function (evt) {
                evt.preventDefault();
                _this.file.Save(_this.editor.getValue())
                    .then(function () {
                    // this.$.save.disabled = true;
                    EBW.Toast("Document saved.");
                })
                    .catch(function (err) {
                    console.error(err);
                    EBW.Error(err);
                });
            },
            'undo': function (evt) {
                evt.preventDefault();
                // if (confirm(`Undo the changes you've just made to ${this.file.Path()}?`)) {
                // 	let orig = this.file.Original();
                // 	this.file.SetText(orig);
                // 	this.setText(orig);
                // 	this.file.SetText(this.file.Original());
                // }
            },
            'delete': function (evt) {
                evt.preventDefault();
                EBW.Confirm("Are you sure you want to delete " + _this.file.Name() + "?")
                    .then(function () {
                    return _this.file.Remove()
                        .then(function (fc) {
                        _this.file = undefined;
                        _this.setFile(undefined);
                    });
                })
                    .catch(EBW.Error);
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
        if ('string' != typeof text) {
            debugger;
        }
        this.editor.setValue(text);
    };
    RepoFileEditorCM.prototype.setFile = function (file) {
        var _this = this;
        /**
         * @TODO NEED TO SAVE THE UNDO HISTORY AND POSSIBLY
         * RESTORE THE UNDO HISTORY FOR THE EDITOR
         */
        if (this.file) {
            if (this.file.Name() == file.Name()) {
                // Cannot set to the file we're currently editing
                return;
            }
            this.file.SetText(this.editor.getValue());
            this.file.SetEditing(false);
        }
        if ('undefined' == typeof file) {
            this.file = undefined;
            this.setText('Please select a file to edit.');
            this.setBoundFilenames();
            return;
        }
        file.GetText()
            .then(function (t) {
            _this.file = file;
            _this.file.SetEditing(true);
            _this.setBoundFilenames();
            _this.setText(t);
        })
            .catch(function (err) {
            EBW.Error(err);
        });
    };
    RepoFileEditorCM.prototype.File = function () {
        return this.file;
    };
    RepoFileEditorCM.prototype.setBoundFilenames = function () {
        var filename = 'CHOOSE A FILE';
        if (this.file) {
            filename = this.file.Name();
        }
        var list = document.querySelectorAll('[ebw-bind="current-filename"]');
        for (var i = 0; i < list.length; i++) {
            var e = list.item(i);
            e.textContent = filename;
        }
    };
    return RepoFileEditorCM;
}(RepoFileEditor_codemirror));

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
var FoundationRevealDialog$1 = (function (_super) {
    tslib_1.__extends(FoundationRevealDialog$$1, _super);
    function FoundationRevealDialog$$1(openElement, content) {
        var _this = _super.call(this) || this;
        _this.Events = new signals.Signal();
        _this.$el = jQuery(_this.el);
        // Comment here
        TSFoundation.Reveal(_this.$el);
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
        if (document.body.firstChild) {
            document.body.insertBefore(_this.el, document.body.firstChild);
        }
        else {
            document.body.appendChild(_this.el);
        }
        return _this;
    }
    // Set the content of the dialog to the given
    // element.
    FoundationRevealDialog$$1.prototype.Set = function (el) {
        this.$.content.innerText = '';
        this.$.content.appendChild(el);
    };
    FoundationRevealDialog$$1.prototype.Open = function () {
        this.$el.foundation('open');
    };
    FoundationRevealDialog$$1.prototype.Close = function () {
        this.$el.foundation('close');
    };
    return FoundationRevealDialog$$1;
}(FoundationRevealDialog));

/**
 * FileStat provides information on the status of a file
 * in a given filesystem.
 */
/**
 * FileStat provides information on the status of a file
 * in a given filesystem.
 */ var FileStat;
(function (FileStat) {
    /** The file exists an is unchanged */
    FileStat[FileStat["Exists"] = 1] = "Exists";
    /** The file exists, and has changed */
    FileStat[FileStat["Changed"] = 2] = "Changed";
    /** The file is a new file */
    FileStat[FileStat["New"] = 3] = "New";
    /** The file is deleted / marked for deletion */
    FileStat[FileStat["Deleted"] = 4] = "Deleted";
    /** The file does not exist */
    FileStat[FileStat["NotExist"] = 5] = "NotExist";
})(FileStat || (FileStat = {}));

var FileContent = (function () {
    function FileContent(Name, Stat, Content, Original) {
        this.Name = Name;
        this.Stat = Stat;
        this.Content = Content;
        this.Original = Original;
    }
    FileContent.prototype.IsContentKnown = function () {
        return (undefined != typeof this.Content);
    };
    FileContent.prototype.Serialize = function () {
        return JSON.stringify(this);
    };
    FileContent.FromJS = function (json) {
        var js = JSON.parse(json);
        return new FileContent(js.Name, js.Stat, js.Content);
    };
    FileContent.prototype.OriginalName = function () {
        if (this.Original) {
            return this.Original.OriginalName();
        }
        return this.Name;
    };
    return FileContent;
}());

var FSFileEdit = (function () {
    function FSFileEdit(fc, FS) {
        this.fc = fc;
        this.FS = FS;
        this.DirtySignal = new signals.Signal();
        this.EditingSignal = new signals.Signal();
    }
    FSFileEdit.prototype.Rename = function (toPath) {
        var _this = this;
        return this.FS.Rename(this.fc.Name, toPath)
            .then(function (fc) {
            _this.fc = fc;
            _this.signalDirty();
            return Promise.resolve(fc);
        });
    };
    FSFileEdit.prototype.Remove = function () {
        var _this = this;
        return this.FS.Remove(this.fc.Name)
            .then(function (fc) {
            _this.fc = fc;
            _this.signalDirty();
            return Promise.resolve(fc);
        });
    };
    FSFileEdit.prototype.Name = function () {
        return this.fc.Name;
    };
    FSFileEdit.prototype.SetEditing = function (editing) {
        this.editing = editing;
        this.EditingSignal.dispatch(this, editing);
    };
    FSFileEdit.prototype.IsEditing = function () {
        return this.editing;
    };
    FSFileEdit.prototype.IsDirty = function () {
        return Promise.resolve(this.isDirty());
    };
    FSFileEdit.prototype.isDirty = function () {
        return this.fc.Stat == FileStat.Changed ||
            this.fc.Stat == FileStat.Deleted ||
            this.fc.Stat == FileStat.New;
    };
    FSFileEdit.prototype.signalDirty = function () {
        this.DirtySignal.dispatch(this, this.isDirty());
    };
    FSFileEdit.prototype.Save = function (t) {
        var _this = this;
        return this.FS.Write(this.fc.Name, FileStat.Changed, t)
            .then(function (fc) {
            _this.fc = fc;
            _this.signalDirty();
            return Promise.resolve(fc);
        });
    };
    FSFileEdit.prototype.GetText = function () {
        var _this = this;
        return this.FS.Read(this.fc.Name)
            .then(function (fc) {
            console.log("FSFileEdit.FS.Read returned ", fc);
            _this.fc = fc;
            return Promise.resolve(fc.Content);
        });
    };
    FSFileEdit.prototype.SetText = function (t) {
        var _this = this;
        return this.FS.Write(this.fc.Name, FileStat.Changed, t)
            .then(function (fc) {
            _this.fc = fc;
            _this.signalDirty();
            return Promise.resolve(fc);
        });
    };
    return FSFileEdit;
}());

var RepoEditorPage_NewFileDialog$1 = (function (_super) {
    tslib_1.__extends(RepoEditorPage_NewFileDialog$$1, _super);
    function RepoEditorPage_NewFileDialog$$1(openElement, FS, editor) {
        var _this = _super.call(this) || this;
        _this.FS = FS;
        _this.editor = editor;
        _a = _this.FS.RepoOwnerName(), _this.repoOwner = _a[0], _this.repoName = _a[1];
        document.body.appendChild(_this.el);
        _this.$el = jQuery(_this.el);
        Eventify(_this.el, {
            "click": function (evt) {
                var filename = _this.$.filename.value;
                _this.FS.Stat(filename)
                    .then(function (fs) {
                    if (!(fs == FileStat.NotExist || fs == FileStat.Deleted)) {
                        EBW.Alert("A file named " + filename + " already exists");
                        return;
                    }
                    _this.FS.Write(filename, FileStat.New, "")
                        .then(function (fc) {
                        _this.dialog.Close();
                        var edit = new FSFileEdit(fc, FS);
                        _this.editor.setFile(edit);
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
        var _a;
    }
    return RepoEditorPage_NewFileDialog$$1;
}(RepoEditorPage_NewFileDialog));

var RepoEditorPage_RenameFileDialog$1 = (function (_super) {
    tslib_1.__extends(RepoEditorPage_RenameFileDialog$$1, _super);
    function RepoEditorPage_RenameFileDialog$$1(openElement, FS, editor) {
        var _this = _super.call(this) || this;
        _this.FS = FS;
        _this.editor = editor;
        _a = _this.FS.RepoOwnerName(), _this.repoOwner = _a[0], _this.repoName = _a[1];
        Eventify(_this.el, {
            "click": function (evt) {
                var toName = _this.$.filename.value;
                _this.editor.File().Rename(toName)
                    .then(function (fc) {
                    _this.dialog.Close();
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
                    _this.$.current_name.innerText = _this.editor.File().Name();
                    break;
                case DialogEvents.Closed:
                    break;
            }
        });
        return _this;
        var _a;
    }
    return RepoEditorPage_RenameFileDialog$$1;
}(RepoEditorPage_RenameFileDialog));

/**
 * FSNotify implements a FS that passes all actual
 * functions through to an underlying FS, but that
 * notifies listeners of activities on the FS.
 */
var FSNotify = (function () {
    function FSNotify(source) {
        this.source = source;
        this.Listeners = new signals.Signal();
    }
    FSNotify.prototype.Write = function (path, stat, content) {
        var _this = this;
        return this.source.Write(path, stat, content)
            .then(function (fc) {
            _this.Listeners.dispatch(path, fc);
            return Promise.resolve(fc);
        });
    };
    FSNotify.prototype.Remove = function (path, stat) {
        var _this = this;
        return this.source.Remove(path, stat)
            .then(function (fc) {
            _this.Listeners.dispatch(path, fc);
            return Promise.resolve(fc);
        });
    };
    FSNotify.prototype.Rename = function (fromPath, toPath) {
        var _this = this;
        return this.source.Rename(fromPath, toPath)
            .then(function (fc) {
            _this.Listeners.dispatch(fromPath, fc);
            return Promise.resolve(fc);
        });
    };
    FSNotify.prototype.Revert = function (path) {
        var _this = this;
        return this.source.Revert(path)
            .then(function (fc) {
            _this.Listeners.dispatch(path, fc);
            return Promise.resolve(fc);
        });
    };
    //=============================================================
    //======= all methods below this point simply pass their calls
    //======= to the underlying FS, and don't require notification.
    //=============================================================
    FSNotify.prototype.Sync = function (path) { return this.source.Sync(); };
    FSNotify.prototype.RepoOwnerName = function () { return this.source.RepoOwnerName(); };
    FSNotify.prototype.Stat = function (path) { return this.source.Stat(path); };
    FSNotify.prototype.Read = function (path) { return this.source.Read(path); };
    return FSNotify;
}());

var store = (function () {
    function store() {
        this.s = new Map();
    }
    store.prototype.clear = function () {
        this.s.clear();
    };
    store.prototype.removeItem = function (k) {
        this.s.delete(k);
    };
    store.prototype.getItem = function (k) {
        // console.log(`store::getItem(${k}) = `, this.s.get(k));
        return this.s.get(k);
    };
    store.prototype.setItem = function (k, v) {
        // console.log(`store::setItem ${k} = ${v}`);
        this.s.set(k, v);
    };
    return store;
}());
var singleton;
function Store() {
    if ('undefined' != typeof sessionStorage) {
        return sessionStorage;
    }
    if (!singleton) {
        singleton = new store();
    }
    return singleton;
}
//# sourceMappingURL=Store.js.map

var FSSession = (function () {
    function FSSession(name, repoOwner, repoName, defaultRemoveStat) {
        if (defaultRemoveStat === void 0) { defaultRemoveStat = FileStat.Deleted; }
        this.name = name;
        this.repoOwner = repoOwner;
        this.repoName = repoName;
        this.defaultRemoveStat = defaultRemoveStat;
        this.key = encodeURIComponent(this.name) + ":" +
            encodeURIComponent(this.repoOwner) + ":" +
            encodeURIComponent(this.repoName) + ":";
    }
    FSSession.prototype.get = function (path) {
        var js = Store().getItem(this.key + path);
        if (!js) {
            return undefined;
        }
        return FileContent.FromJS(js);
    };
    FSSession.prototype.set = function (c) {
        if (c.Stat == FileStat.NotExist) {
            this.delete(c.Name);
            return;
        }
        Store().setItem(this.key + c.Name, c.Serialize());
    };
    FSSession.prototype.delete = function (path) {
        Store().removeItem(this.key + path);
    };
    FSSession.prototype.Stat = function (path) {
        var c = this.get(path);
        return Promise.resolve(c ? c.Stat : FileStat.NotExist);
    };
    FSSession.prototype.Read = function (path) {
        var c = this.get(path);
        if (!c) {
            return Promise.reject(path + " does not exist");
        }
        return Promise.resolve(c);
    };
    FSSession.prototype.Write = function (path, stat, content) {
        var f = new FileContent(path, stat, content);
        this.set(f);
        return Promise.resolve(f);
    };
    FSSession.prototype.Remove = function (path, stat) {
        var c = this.get(path);
        if (!c) {
            console.log("Tried to remove " + path + " which does not appear to exist");
            return Promise.resolve(new FileContent(path, FileStat.NotExist));
        }
        if (!stat) {
            stat = this.defaultRemoveStat;
        }
        var fc = new FileContent(path, stat, c.Content);
        this.set(fc);
        return Promise.resolve(fc);
    };
    FSSession.prototype.Rename = function (fromPath, toPath) {
        if (fromPath == toPath) {
            return Promise.reject("Renaming isn't changing name");
        }
        var f = this.get(fromPath);
        var t = this.get(toPath);
        if (!f) {
            return Promise.reject(fromPath + " does not exist");
        }
        if (t) {
            return Promise.reject(toPath + " already exists");
        }
        t = new FileContent(toPath, FileStat.Changed, f.Content, f);
        this.set(t);
        f = new FileContent(fromPath, this.defaultRemoveStat, f.Content);
        this.set(f);
        return Promise.resolve(t);
    };
    FSSession.prototype.Sync = function (path) {
        return Promise.reject("FSSession doesn't support Sync");
    };
    FSSession.prototype.RepoOwnerName = function () {
        return [this.repoOwner, this.repoName];
    };
    FSSession.prototype.Revert = function (path) {
        return Promise.reject("FSSession doesn't support Revert");
    };
    return FSSession;
}());

var FSRemote = (function () {
    function FSRemote(repoOwner, repoName) {
        this.repoOwner = repoOwner;
        this.repoName = repoName;
    }
    FSRemote.prototype.Stat = function (path) {
        return EBW.API()
            .FileExists(this.repoOwner, this.repoName, path)
            .then(function (_a) {
            var exists = _a[0];
            // Remote system is definitive
            return Promise.resolve(exists ? FileStat.Exists : FileStat.NotExist);
        });
    };
    FSRemote.prototype.Read = function (path) {
        return EBW.API()
            .GetFileString(this.repoOwner, this.repoName, path)
            .then(function (_a) {
            var content = _a[0];
            return new FileContent(path, FileStat.Exists, content);
        });
    };
    FSRemote.prototype.Write = function (path, stat, content) {
        if ('undefined' == typeof content) {
            return Promise.reject("FSRemote cannot write file " + path + " without content.");
        }
        return EBW.API()
            .UpdateFile(this.repoOwner, this.repoName, path, content)
            .then(function () {
            return new FileContent(path, FileStat.Exists, content);
        });
    };
    FSRemote.prototype.Rename = function (fromPath, toPath) {
        var _this = this;
        return EBW.API().RenameFile(this.repoOwner, this.repoName, fromPath, toPath)
            .then(function () {
            return _this.Read(toPath);
        });
    };
    FSRemote.prototype.Remove = function (path, stat) {
        return EBW.API().RemoveFile(this.repoOwner, this.repoName, path)
            .then(function () {
            return Promise.resolve(new FileContent(path, FileStat.NotExist));
        });
    };
    FSRemote.prototype.Sync = function (path) {
        return Promise.reject("FSRemote doesn't support Sync()");
    };
    FSRemote.prototype.RepoOwnerName = function () {
        return [this.repoOwner, this.repoName];
    };
    FSRemote.prototype.Revert = function (path) {
        return Promise.reject("FSRemove doesn't support Revert");
    };
    return FSRemote;
}());

var FSReadCache = (function () {
    function FSReadCache(source) {
        this.source = source;
        var _a = this.source.RepoOwnerName(), owner = _a[0], name = _a[1];
        this.cache = new FSSession("source-cache", owner, name);
    }
    FSReadCache.prototype.RepoOwnerName = function () {
        return this.source.RepoOwnerName();
    };
    FSReadCache.prototype.Read = function (path) {
        var _this = this;
        return this.cache.Stat(path)
            .then(function (s) {
            switch (s) {
                case FileStat.Exists:
                    return _this.readAndCachePath(path);
                case FileStat.Changed:
                //fallthrough
                case FileStat.New:
                //fallthrough
                case FileStat.Deleted:
                    return _this.cache.Read(path);
                case FileStat.NotExist:
                    return _this.source.Read(path)
                        .then(function (c) {
                        _this.cache.Write(path, c.Stat, c.Content);
                        return Promise.resolve(c);
                    });
            }
        });
    };
    FSReadCache.prototype.readAndCachePath = function (path) {
        var _this = this;
        return this.cache.Read(path)
            .then(function (fc) {
            if (fc.Content) {
                return Promise.resolve(fc);
            }
            return _this.source.Read(path)
                .then(function (fc) {
                return _this.cache.Write(path, fc.Stat, fc.Content);
            });
        });
    };
    FSReadCache.prototype.Remove = function (path, stat) {
        var _this = this;
        return this.source.Remove(path, stat).then(function (fc) {
            return _this.cache.Remove(path, fc.Stat);
        });
    };
    FSReadCache.prototype.Rename = function (fromPath, toPath) {
        var _this = this;
        return this.source.Rename(fromPath, toPath).then(function (fc) {
            // TODO: Consider whether this shouldn't just
            // remove fromPath from the cache and 
            // update toPath ... ?
            return _this.cache.Rename(fromPath, toPath);
        });
    };
    FSReadCache.prototype.Revert = function (path) {
        var _this = this;
        return this.source.Revert(path)
            .then(function (c) {
            return _this.cache.Write(c.Name, c.Stat, c.Content);
        });
    };
    FSReadCache.prototype.Stat = function (path) {
        var _this = this;
        return this.cache.Stat(path)
            .then(function (s) {
            if (FileStat.NotExist == s) {
                return _this.source.Stat(path);
            }
            return Promise.resolve(s);
        });
    };
    FSReadCache.prototype.Sync = function (path) {
        return this.source.Sync(path);
    };
    FSReadCache.prototype.Write = function (path, stat, content) {
        var _this = this;
        if ('undefined' == typeof content) {
            return this.cache.Write(path, stat);
        }
        return this.source.Write(path, stat, content).then(function (fc) {
            return _this.cache.Write(fc.Name, fc.Stat, fc.Content);
        });
    };
    return FSReadCache;
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

/**
 * FSFileList_File implements a single file element in the
 * list of files in the FileSystem.
 */
var FSFileList_File$1 = (function (_super) {
    tslib_1.__extends(FSFileList_File$$1, _super);
    function FSFileList_File$$1(parent, file, FS, events, ignoreFunction) {
        var _this = _super.call(this) || this;
        _this.file = file;
        _this.FS = FS;
        _this.ignoreFunction = ignoreFunction;
        if (_this.ignoreFunction(_this.file.Name)) {
            _this.el.classList.add('ignore');
        }
        _this.$.name.textContent = _this.file.Name;
        Eventify(_this.el, events);
        _this.FS.Listeners.add(_this.FSEvent, _this);
        AddToParent(parent, _this.el);
        return _this;
    }
    FSFileList_File$$1.prototype.FSEvent = function (path, fc) {
        if (path != this.file.Name) {
            // If path's don't match, this doesn't affect us.
            return;
        }
        console.log("FileEvent in _File: " + fc.Name + ", state = ", fc.Stat);
        switch (fc.Stat) {
            case FileStat.Changed:
                this.el.classList.add('changed');
                break;
            case FileStat.Deleted:
                this.el.classList.remove('changed');
                this.el.classList.add('removed');
                break;
            case FileStat.Exists:
                this.el.classList.remove('changed', 'removed');
                break;
            case FileStat.NotExist:
                this.el.remove();
                this.FS.Listeners.remove(this.FSEvent, this);
                break;
        }
    };
    return FSFileList_File$$1;
}(FSFileList_File));

// import {Directory} from './Directory';
var FSFileList = (function () {
    function FSFileList(parent, editor, FS, ignoreFunction) {
        this.parent = parent;
        this.editor = editor;
        this.FS = FS;
        this.ignoreFunction = ignoreFunction;
        this.api = EBW.API();
        this.FS.Listeners.add(this.FSEvent, this);
        this.files = new Map();
    }
    FSFileList.prototype.FSEvent = function (path, fc) {
        console.log("FSFileList.FSEvent -- fileContent = ", fc);
        var f = this.files.get(fc.Name);
        switch (fc.Stat) {
            case FileStat.New:
            //	fallthrough
            case FileStat.Exists:
            // fallthrough
            case FileStat.Changed:
                if (!f) {
                    this.newFile(fc);
                }
                break;
            case FileStat.Deleted:
                // The filelist_file class will handle this itself
                break;
            case FileStat.NotExist:
                if (f) {
                    this.files.delete(fc.Name);
                }
                break;
        }
    };
    FSFileList.prototype.newFile = function (fc) {
        var _this = this;
        var f = new FSFileList_File$1(this.parent, fc, this.FS, {
            clickFile: function (evt) {
                _this.FS.Read(fc.Name)
                    .then(function (fc) {
                    console.log("We've got content: ", fc);
                    console.log("clicked " + fc.Name + " - NEED TO SEND TO EDITOR");
                    var edit = new FSFileEdit(fc, _this.FS);
                    _this.editor.setFile(edit);
                });
                // TODO :: Need to send a RepoFileModel to the
                // editor...
                // let m = this.fileCache.Create(fileInfo);
                // this.editor.setFile(m);
            }
        }, this.ignoreFunction);
        this.files.set(fc.Name, f);
        return f;
    };
    return FSFileList;
}());

var File = (function () {
    function File(parent, name) {
        this._parent = parent;
        this._name = name;
    }
    File.FromJS = function (parent, js) {
        return new File(parent, js.N);
    };
    File.prototype.Debug = function () {
        console.log(this.Path());
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
        var d = new Directory(parent, js.N);
        for (var _i = 0, _a = js.F; _i < _a.length; _i++) {
            var f = _a[_i];
            var e = void 0;
            if (f.F) {
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

function FSPrimeFromJS(fs, js) {
    var d = Directory.FromJS(undefined, js);
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
        fs.Write(f, FileStat.Exists);
    }
}
//# sourceMappingURL=FSPrimeFromJS.js.map

var RepoEditorPage = (function () {
    function RepoEditorPage(repoOwner, repoName, filesList, filesJson, proseIgnoreFunction) {
        var _this = this;
        this.repoOwner = repoOwner;
        this.repoName = repoName;
        this.proseIgnoreFunction = proseIgnoreFunction;
        this.repoOwner = repoOwner;
        this.repoName = repoName;
        this.editor = undefined;
        this.editor = new RepoFileEditorCM(document.getElementById('editor'), {
            Rename: function () {
                return;
            }
        });
        var remoteFS = new FSReadCache(new FSRemote(this.repoOwner, this.repoName));
        var localFS = new FSSession("temp-rootf", this.repoOwner, this.repoName);
        this.FS = new FSNotify(remoteFS);
        new FSFileList(filesList, this.editor, this.FS, this.proseIgnoreFunction);
        new RepoEditorPage_NewFileDialog$1(document.getElementById('repo-new-file'), this.FS, this.editor);
        new RepoEditorPage_RenameFileDialog$1(document.getElementById("repo-rename-file"), this.FS, this.editor);
        FSPrimeFromJS(this.FS, filesJson);
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
        /**
         * @TODO
         * Need to catch any attempt to leave RepoEditorPage and
         * check that the user has saved any changes.
         */
    }
    RepoEditorPage.instantiate = function () {
        var el = document.getElementById("repo-editor-page");
        if (el) {
            console.error("RepoEditorPage should be constructed directly to receive ProseIgnoreFunction");
            debugger;
            console.log("Instantiating RepoEditorPage");
            var repoOwner = el.getAttribute('repo-owner');
            var repoName = el.getAttribute('repo-name');
            // let volume = new VolumeElement()
            // let allFilesList = document.querySelector(`[data-instance='AllFilesList']`);
            var filesList = document.querySelector("[data-instance='AllFilesList']");
            var primeFSel = document.getElementById("volume-element");
            var primeFSjs = JSON.parse(primeFSel.innerText);
            new RepoEditorPage(repoOwner, repoName, filesList, primeFSjs, function (name) {
                return false;
            });
        }
    };
    return RepoEditorPage;
}());
window.RepoEditorPage = RepoEditorPage;

var FileState;
(function (FileState) {
    // This is a file that exists on the FS, 
    // but hasn't changed.
    FileState[FileState["Exists"] = 1] = "Exists";
    // A file that has been changed, but not
    // not 'Synced'.
    FileState[FileState["Changed"] = 2] = "Changed";
    // A New file, much like Changed, but doesn't
    // exist in the underlying system
    FileState[FileState["New"] = 4] = "New";
    // A deleted file that hasn't yet been synced.
    FileState[FileState["Deleted"] = 8] = "Deleted";
    // A file that doesn't exist at all. A deleted
    // file once Sync'd becomes NotExist
    FileState[FileState["NotExist"] = 16] = "NotExist";
})(FileState || (FileState = {}));

//# sourceMappingURL=FileState.js.map

var AllFiles_File$1 = (function (_super) {
    tslib_1.__extends(AllFiles_File$$1, _super);
    function AllFiles_File$$1(parent, fileInfo, events) {
        var _this = _super.call(this) || this;
        _this.fileInfo = fileInfo;
        _this.$.name.textContent = fileInfo.Name();
        Eventify(_this.el, events);
        fileInfo.Listener.add(_this.FileEvent, _this);
        AddToParent(parent, _this.el);
        return _this;
    }
    AllFiles_File$$1.prototype.FileEvent = function (fileInfo) {
        console.log("FileEvent in _File: " + fileInfo.Name() + ", state = ", fileInfo.State());
        switch (fileInfo.State()) {
            case FileState.Exists:
                this.el.classList.remove('changed', 'removed');
                break;
            case FileState.Changed:
                this.el.classList.add('changed');
                break;
            case FileState.Deleted:
                this.el.classList.remove('changed');
                this.el.classList.add('removed');
                break;
            case FileState.NotExist:
                this.el.remove();
                break;
        }
    };
    return AllFiles_File$$1;
}(AllFiles_File));

// import {Directory} from './Directory';

var MergeEditor$1 = (function (_super) {
    tslib_1.__extends(MergeEditor$$1, _super);
    function MergeEditor$$1(parent, model) {
        var _this = _super.call(this) || this;
        _this.parent = parent;
        _this.model = model;
        Eventify(_this.el, {
            'save': function (evt) {
                evt.preventDefault();
                model.Update(_this.get())
                    .catch(function (err) {
                    console.log("Error on the save function");
                    EBW.Error(err);
                });
            }
        });
        AddToParent(_this.parent, _this.el);
        model.GetContent()
            .then(function (args) { return _this.mergely(args); })
            .catch(EBW.Error);
        return _this;
    }
    MergeEditor$$1.prototype.get = function () {
        var cm = jQuery(this.mergelyDiv).mergely('cm', 'lhs');
        return cm.getDoc().getValue();
    };
    MergeEditor$$1.prototype.mergely = function (_a) {
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
            rhs_cmsettings: {},
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
    return MergeEditor$$1;
}(MergeEditor));

var PRDiffModel = (function () {
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
        return EBW.API().PullRequestVersions(this.prArgs.repoOwner, this.prArgs.repoName, this.prArgs.remoteURL, this.prArgs.remoteSHA, this.diff.path);
    };
    PRDiffModel.prototype.Update = function (content) {
        return EBW.API().PullRequestUpdate(this.prArgs.repoOwner, this.prArgs.repoName, this.prArgs.remoteSHA, this.diff.path, content);
    };
    return PRDiffModel;
}());

var PullRequestDiffList_File$1 = (function (_super) {
    tslib_1.__extends(PullRequestDiffList_File$$1, _super);
    function PullRequestDiffList_File$$1(parent, diff, callback) {
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
    return PullRequestDiffList_File$$1;
}(PullRequestDiffList_File));

var PullRequestMergePage = (function () {
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
        new MergeEditor$1(this.mergelyParent, diff);
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

var EBW = (function () {
    function EBW() {
        if (null == EBW.instance) {
            EBW.instance = this;
            this.api = new APIWs();
            console.log("Activating foundation on the document");
            jQuery(document).foundation();
            /* TODO: This should actually use a Router
               to determine what content we have. */
            AddNewBookDialog$$1.instantiate();
            RepoEditorPage.instantiate();
            PullRequestMergePage.instantiate();
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
    new EBW();
});

exports.EBW = EBW;

}((this.EBW = this.EBW || {}),tslib,TSFoundation));
//# sourceMappingURL=ts.js.map
