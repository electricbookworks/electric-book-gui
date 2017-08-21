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
    APIWs.prototype.StageFile = function (repoOwner, repoName, path) {
        return this.rpc("StageFile", [repoOwner, repoName, path]);
    };
    APIWs.prototype.StageFileAndReturnMergingState = function (repoOwner, repoName, path) {
        return this.rpc("StageFileAndReturnMergingState", [repoOwner, repoName, path]);
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
    APIWs.prototype.SaveMergingFile = function (repoOwner, repoName, path, workingExists, workingContent, theirExists, theirContent) {
        return this.rpc("SaveMergingFile", [repoOwner, repoName, path, workingExists, workingContent, theirExists, theirContent]);
    };
    APIWs.prototype.MergeFileOriginal = function (repoOwner, repoName, path, version) {
        return this.rpc("MergeFileOriginal", [repoOwner, repoName, path, version]);
    };
    APIWs.prototype.FindFileLists = function (repoOwner, repoName) {
        return this.rpc("FindFileLists", [repoOwner, repoName]);
    };
    return APIWs;
}());

var Context = (function () {
    function Context(el, RepoOwner, RepoName) {
        this.el = el;
        this.RepoOwner = RepoOwner;
        this.RepoName = RepoName;
        // I should probably also pass the EBW in the context,
        // but since _all_ of the EBW methods are static, it is
        // pretty unnecessary
    }
    Context.prototype.API = function () {
        return EBW.API();
    };
    Context.prototype.EBW = function () {
        return new EBW();
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
            d.innerHTML = "<div><div><h1>Add a project</h1><fieldset><label><input type=\"radio\" value=\"new\" name=\"new-project-type\"/>\n\t\t\t\tStart a new project.\n\t\t\t</label><label><input type=\"radio\" value=\"collaborate\" name=\"new-project-type\"/>\n\t\t\t\tCollaborate on an existing project.\n\t\t\t</label></fieldset><button data-event=\"click:choseType\" class=\"btn\">Next</button></div><div><h1>New project</h1><form method=\"post\" action=\"/github/create/new\"><input type=\"hidden\" name=\"action\" value=\"new\"/><label>Enter the name for your new project.\n\t\t<input type=\"text\" name=\"repo_new\" placeholder=\"e.g. MobyDick\"/>\n\t\t</label><input type=\"submit\" class=\"btn\" value=\"New project\"/></form></div><div><h1>Collaborate</h1><form method=\"post\" action=\"/github/create/fork\"><input type=\"hidden\" name=\"action\" value=\"fork\"/><label>Enter the GitHub owner and repo for the project you will collaborate on.\n\t\t<input type=\"text\" name=\"collaborate_repo\" placeholder=\"e.g. electricbooks/core\"/>\n\t\t</label><input type=\"submit\" class=\"btn\" value=\"Collaborate\"/></form></div></div>";
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
var CommitMessageDialog = (function () {
    function CommitMessageDialog() {
        var t = CommitMessageDialog._template;
        if (!t) {
            var d = document.createElement('div');
            d.innerHTML = "<div><h1>Title</h1><div>Instructions</div><fieldset><label for=\"commitMessage\">Describe your changes\n\t\t<input type=\"text\" name=\"commitMessage\" id=\"commitMessage\"/>\n\t\t</label></fieldset><button class=\"btn\">Commit</button></div>";
            t = d.firstElementChild;
            CommitMessageDialog._template = t;
        }
        var n = t.cloneNode(true);
        this.$ = {
            title: n.childNodes[0],
            instructions: n.childNodes[1],
            message: n.childNodes[2].childNodes[0].childNodes[1],
            commit: n.childNodes[3],
        };
        this.el = n;
    }
    return CommitMessageDialog;
}());
var EditorImage = (function () {
    function EditorImage() {
        var t = EditorImage._template;
        if (!t) {
            var d = document.createElement('div');
            d.innerHTML = "<div> </div>";
            t = d.firstElementChild;
            EditorImage._template = t;
        }
        var n = t.cloneNode(true);
        this.$ = {};
        this.el = n;
    }
    return EditorImage;
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
var FileListDialog = (function () {
    function FileListDialog() {
        var t = FileListDialog._template;
        if (!t) {
            var d = document.createElement('div');
            d.innerHTML = "<div><h1>Print Version</h1><p>Choose the project version you want to print:</p><ul class=\"file-list-dialog-list\">\n\t</ul></div>";
            t = d.firstElementChild;
            FileListDialog._template = t;
        }
        var n = t.cloneNode(true);
        this.$ = {
            list: n.childNodes[2],
        };
        this.el = n;
    }
    return FileListDialog;
}());
var FileListDialog_Item = (function () {
    function FileListDialog_Item() {
        var t = FileListDialog_Item._template;
        if (!t) {
            var d = document.createElement('div');
            d.innerHTML = "<ul><li data-set=\"this\"><input type=\"radio\" name=\"file-list\"/><span/></li></ul>";
            t = d.firstElementChild.childNodes[0];
            FileListDialog_Item._template = t;
        }
        var n = t.cloneNode(true);
        this.$ = {
            input: n.childNodes[0],
            title: n.childNodes[1],
        };
        this.el = n;
    }
    return FileListDialog_Item;
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
            d.innerHTML = "<div>\n</div>";
            t = d.firstElementChild;
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
var RepoFileEditorCM = (function () {
    function RepoFileEditorCM() {
        var t = RepoFileEditorCM._template;
        if (!t) {
            var d = document.createElement('div');
            d.innerHTML = "<div class=\"repo-file-editor-workspace\"><div class=\"repo-file-editor\">\n\t</div><div class=\"repo-image-editor\">\n\t</div></div>";
            t = d.firstElementChild;
            RepoFileEditorCM._template = t;
        }
        var n = t.cloneNode(true);
        this.$ = {
            textEditor: n.childNodes[0],
            imageEditor: n.childNodes[1],
        };
        this.el = n;
    }
    return RepoFileEditorCM;
}());
var conflict_ClosePRDialog = (function () {
    function conflict_ClosePRDialog() {
        var t = conflict_ClosePRDialog._template;
        if (!t) {
            var d = document.createElement('div');
            d.innerHTML = "<div><h1>Title</h1><div>Instructions</div><fieldset><label for=\"closePR-no\"><input type=\"radio\" name=\"closePR\" id=\"closePR-no\" value=\"no\" data-event=\"change\"/>No\n\t\t</label><label for=\"closePR-yes\"><input type=\"radio\" name=\"closePR\" id=\"closePR-yes\" value=\"yes\" data-event=\"change\"/>Yes\n\t\t</label><label for=\"closeMessage\">Close message\n\t\t<input type=\"text\" name=\"closeMessage\" id=\"closeMessage\"/>\n\t\t</label></fieldset><button class=\"btn\" data-event=\"click:done\">Done</button></div>";
            t = d.firstElementChild;
            conflict_ClosePRDialog._template = t;
        }
        var n = t.cloneNode(true);
        this.$ = {
            title: n.childNodes[0],
            instructions: n.childNodes[1],
            closePR_no: n.childNodes[2].childNodes[0].childNodes[0],
            closePR_yes: n.childNodes[2].childNodes[1].childNodes[0],
            closeMessage: n.childNodes[2].childNodes[2].childNodes[1],
        };
        this.el = n;
    }
    return conflict_ClosePRDialog;
}());
var conflict_FileDisplay = (function () {
    function conflict_FileDisplay() {
        var t = conflict_FileDisplay._template;
        if (!t) {
            var d = document.createElement('div');
            d.innerHTML = "<li class=\"file-display\"><span class=\"path\"> </span><span class=\"status\"> </span></li>";
            t = d.firstElementChild;
            conflict_FileDisplay._template = t;
        }
        var n = t.cloneNode(true);
        this.$ = {
            path: n.childNodes[0],
            status: n.childNodes[1],
        };
        this.el = n;
    }
    return conflict_FileDisplay;
}());
var conflict_FileListDisplay = (function () {
    function conflict_FileListDisplay() {
        var t = conflict_FileListDisplay._template;
        if (!t) {
            var d = document.createElement('div');
            d.innerHTML = "<ul class=\"conflict-file-list-display\">\n</ul>";
            t = d.firstElementChild;
            conflict_FileListDisplay._template = t;
        }
        var n = t.cloneNode(true);
        this.$ = {};
        this.el = n;
    }
    return conflict_FileListDisplay;
}());
var conflict_MergeInstructions = (function () {
    function conflict_MergeInstructions() {
        var t = conflict_MergeInstructions._template;
        if (!t) {
            var d = document.createElement('div');
            d.innerHTML = "<div class=\"merge-instructions\"><div class=\"instructions-button\">?</div><div class=\"instructions-text\"><h1>Working with the merge editor</h1><p>The file being submitted is displayed in the editor on the <span class=\"editor-side\">THEIRSIDE</span> side.</p><p>The final file you will save is displayed in the editor on the <span class=\"editor-side\">OURSIDE</span> side.</p><p>Use the small buttons to the left of lines to transfer changes between sides.</p><p>When you are satisfied with your changes, press 'Save these changes' to save your changes.</p><p>When you have resolved all the issues between all the files, press 'Resolve this merge' to resolve the conflicted state.</p></div></div>";
            t = d.firstElementChild;
            conflict_MergeInstructions._template = t;
        }
        var n = t.cloneNode(true);
        this.$ = {
            show: n.childNodes[0],
            text: n.childNodes[1],
            theirSide: n.childNodes[1].childNodes[1].childNodes[1],
            ourSide: n.childNodes[1].childNodes[2].childNodes[1],
        };
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

var RepoMergeDirectButton = (function () {
    function RepoMergeDirectButton(context, el) {
        this.context = context;
        this.el = el;
        var href = "/repo/" + context.RepoOwner + "/" +
            (context.RepoName + "/merge/") +
            el.getAttribute('data-repo-merge') +
            "?resolve=our&conflicted=yes";
        console.log("onclick for ", el, "  = ", href);
        el.addEventListener("click", function (evt) {
            evt.preventDefault();
            evt.stopPropagation();
            document.location.href = "/repo/" + context.RepoOwner + "/" +
                (context.RepoName + "/merge/") +
                el.getAttribute('data-repo-merge') +
                "?resolve=our&conflicted=false";
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

var RepoDetailPage = (function () {
    function RepoDetailPage(context) {
        this.context = context;
        RepoMergeDirectButton.init(this.context);
        document.getElementById("cancelAllChanges").addEventListener("click", function (evt) {
            evt.preventDefault();
            evt.stopPropagation();
            EBW.Confirm("All your changes will be lost. This is non-recoverable. Continue?")
                .then(function (b) {
                if (b) {
                    document.location.href = "/repo/" + context.RepoOwner + "/" + context.RepoName + "/conflict/abort";
                    return;
                }
            });
        });
        // let dialog = new RepoMergeDialog(context, undefined);
        // RepoMergeButton.init(this.context, dialog);
        // dialog.MergeEvent.add(this.mergeEvent, this);
    }
    return RepoDetailPage;
}());

// A ControlTag controls the appearance of another div, most likely changing
// it's width or making it appear / disappear
var ControlTag = (function () {
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
var FoundationRevealDialog$1 = (function (_super) {
    tslib_1.__extends(FoundationRevealDialog$$1, _super);
    function FoundationRevealDialog$$1(openElement, content) {
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

var FileListDialogItem = (function (_super) {
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

var FileListDialog$1 = (function (_super) {
    tslib_1.__extends(FileListDialog$$1, _super);
    function FileListDialog$$1() {
        var _this = _super.call(this) || this;
        _this.dialog = new FoundationRevealDialog$1(undefined, _this.el);
        _this.dialog.Events.add(_this.dialogEvent, _this);
        return _this;
    }
    FileListDialog$$1.prototype.Close = function (filePath) {
        this.resolve({
            FileList: filePath,
            Cancelled: false
        });
        this.resolve = undefined;
        this.dialog.Close();
    };
    FileListDialog$$1.prototype.dialogEvent = function (evt) {
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
    FileListDialog$$1.prototype.Open = function (fileList) {
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
    return FileListDialog$$1;
}(FileListDialog));

var PrintListener = (function () {
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
            EBW.Error("PrintListener format parameter must be either 'print' or 'screen'");
            return;
        }
        EBW.API().FindFileLists(repoOwner, repoName).then(function (_a) {
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
            return EBW.API().PrintPdfEndpoint(repoOwner, repoName, book, format, filedir);
        }).then(function (_a) {
            var url = _a[0];
            if ('undefined' == typeof url) {
                return;
            }
            _this.startListener(url);
        }).catch(EBW.Error);
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
        if (2 == res.length) {
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
//# sourceMappingURL=DOM.js.map

var EditorImage$1 = (function (_super) {
    tslib_1.__extends(EditorImage$$1, _super);
    function EditorImage$$1(parent, repoOwner, repoName) {
        var _this = _super.call(this) || this;
        _this.parent = parent;
        _this.repoOwner = repoOwner;
        _this.repoName = repoName;
        AddToParent(parent, _this.el);
        return _this;
    }
    EditorImage$$1.prototype.setFile = function (f) {
        this.file = f;
        var L = document.location;
        var imageUrl = "url('/www/" +
            (this.repoOwner + "/" + this.repoName + "/" + f.Name() + "')");
        this.el.style.backgroundImage = imageUrl;
    };
    return EditorImage$$1;
}(EditorImage));

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

function FileStatString(fs) {
    switch (fs) {
        case FileStat.Exists:
            return "Exists";
        case FileStat.Changed:
            return "Changed";
        case FileStat.New:
            return "New";
        case FileStat.Deleted:
            return "Deleted";
        case FileStat.NotExist:
            return "NotExist";
    }
    debugger;
    return "-- ERROR : undefined FileStat ---";
}
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

var EditorEvents;
(function (EditorEvents) {
    EditorEvents[EditorEvents["SAVED"] = 1] = "SAVED";
    EditorEvents[EditorEvents["CHANGED"] = 2] = "CHANGED";
    EditorEvents[EditorEvents["LOADED"] = 3] = "LOADED";
})(EditorEvents || (EditorEvents = {}));
var repoEditorActionBar = (function () {
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
        this.editor.EditEvents.add(this.EditEvents, this);
    }
    repoEditorActionBar.prototype.EditEvents = function (ev, file) {
        if (!file) {
            this.deleteButton.disabled = true;
            this.deleteButton.innerText = 'Delete';
            this.saveButton.disabled = true;
            this.undoButton.disabled = true;
            this.renameButton.disabled = true;
            return;
        }
        this.deleteButton.disabled = false;
        this.saveButton.disabled = false;
        this.undoButton.disabled = false;
        this.renameButton.disabled = false;
        console.log("repoEditorActionBar: file = ", file.FileContent() ? FileStatString(file.FileContent().Stat) : "", file);
        this.deleteButton.innerText = (file.IsDeleted()) ? "Undelete" : "Delete";
    };
    return repoEditorActionBar;
}());
/**
 * RepoFileEditorCM is a file editor that wraps what was meant to be
 * a generic editor, but in actual fact turns out to have some
 * dependencies upon CodeMirror, and hence isn't entirely generic.
 */
var RepoFileEditorCM$1 = (function (_super) {
    tslib_1.__extends(RepoFileEditorCM$$1, _super);
    function RepoFileEditorCM$$1(repoOwner, repoName, parent, callbacks) {
        var _this = _super.call(this) || this;
        _this.parent = parent;
        _this.callbacks = callbacks;
        _this.undoKey = "RepoFileEditorCM:UndoHistory:" + encodeURIComponent(repoOwner) + ":" + encodeURIComponent(repoName) + ":";
        _this.EditEvents = new signals.Signal();
        new repoEditorActionBar(_this);
        _this.EditEvents.dispatch(EditorEvents.LOADED, undefined);
        _this.textEditor = new EditorCodeMirror(_this.$.textEditor);
        _this.imageEditor = new EditorImage$1(_this.$.imageEditor, repoOwner, repoName);
        _this.parent.appendChild(_this.el);
        return _this;
    }
    RepoFileEditorCM$$1.prototype.undoEditorFile = function () {
        var _this = this;
        EBW.Confirm("Undo the changes you've just made to " + this.file.Name() + "?")
            .then(function (b) {
            if (!b)
                return;
            _this.file.Revert()
                .then(function (fc) {
                _this.file.SetFileContent(fc);
                _this.textEditor.setValue(fc.Content);
                _this.EditEvents.dispatch(EditorEvents.CHANGED, _this.file);
            });
        });
    };
    /**
     * deleteEditorFile handles file deleting and undeleting.
     */
    RepoFileEditorCM$$1.prototype.deleteEditorFile = function () {
        var _this = this;
        if (!this.file) {
            EBW.Alert("Please choose a file before using delete/undelete");
            return;
        }
        if (this.file.IsDeleted()) {
            this.file.Save(this.textEditor.getValue(), FileStat.Changed)
                .then(function (fc) {
                if (fc.Stat != FileStat.NotExist) {
                    _this.file.SetFileContent(fc);
                    _this.EditEvents.dispatch(EditorEvents.CHANGED, _this.file);
                }
                else {
                    _this.file = undefined;
                    _this.setFile(undefined);
                    _this.EditEvents.dispatch(EditorEvents.LOADED, undefined);
                }
            });
            return;
        }
        EBW.Confirm("Are you sure you want to delete " + this.file.Name() + "?")
            .then(function () {
            return _this.file.Remove()
                .then(function (fc) {
                if (fc.Stat == FileStat.NotExist) {
                    _this.file = undefined;
                    _this.setFile(undefined);
                    _this.EditEvents.dispatch(EditorEvents.LOADED, undefined);
                }
                else {
                    _this.file.SetFileContent(fc);
                    _this.EditEvents.dispatch(EditorEvents.CHANGED, _this.file);
                }
            });
        })
            .catch(EBW.Error);
    };
    RepoFileEditorCM$$1.prototype.saveEditorFile = function () {
        var _this = this;
        this.file.Save(this.textEditor.getValue())
            .then(function (fc) {
            console.log("About to Sync " + _this.file.Name());
            return _this.file.Sync();
        })
            .then(function (fc) {
            if (fc.Stat == FileStat.NotExist) {
                EBW.Toast(_this.file.Name() + " removed");
                // By presetting file to undefined, we ensure that
                // setFile doesn't save the file again
                _this.file = undefined;
                _this.setFile(undefined);
                _this.EditEvents.dispatch(EditorEvents.LOADED, undefined);
            }
            else {
                _this.file.SetFileContent(fc);
                _this.EditEvents.dispatch(EditorEvents.CHANGED, _this.file);
                EBW.Toast(_this.file.Name() + " saved.");
            }
        })
            .catch(function (err) {
            console.error(err);
            EBW.Error(err);
        });
    };
    RepoFileEditorCM$$1.prototype.setText = function (text) {
        if ('string' != typeof text) {
            debugger;
        }
        this.textEditor.setValue(text);
    };
    /**
     * saveHistoryFor saves the history for the given path
     */
    RepoFileEditorCM$$1.prototype.saveHistoryFor = function (path) {
        var key = this.undoKey + path;
        sessionStorage.setItem(key, this.textEditor.getHistory());
    };
    /**
     * restoreHistoryFor restores the history for the given
     * path
     */
    RepoFileEditorCM$$1.prototype.restoreHistoryFor = function (path) {
        var key = this.undoKey + path;
        this.textEditor.setHistory(sessionStorage.getItem(key));
    };
    RepoFileEditorCM$$1.prototype.setFile = function (file) {
        var _this = this;
        if (this.file) {
            if (this.file.Name() == file.Name()) {
                // Cannot set to the file we're currently editing
                return;
            }
            this.file.Save(this.textEditor.getValue());
            this.file.SetEditing(false);
            this.saveHistoryFor(this.file.Name());
        }
        if ('undefined' == typeof file) {
            this.file = undefined;
            this.setText('Please select a file to edit.');
            this.setBoundFilenames();
            this.EditEvents.dispatch(EditorEvents.LOADED, undefined);
            return;
        }
        var imgRegexp = new RegExp(".*.(jpg|png|tiff|svg|gif)$");
        if (imgRegexp.test(file.Name())) {
            this.imageEditor.setFile(file);
            this.showImageEditor();
            this.file = undefined;
            this.EditEvents.dispatch(EditorEvents.LOADED, undefined);
            return;
        }
        this.showTextEditor();
        file.GetText()
            .then(function (t) {
            _this.file = file;
            _this.file.SetEditing(true);
            _this.setBoundFilenames();
            _this.setText(t);
            _this.restoreHistoryFor(_this.file.Name());
            _this.textEditor.setModeOnFilename(file.Name());
            _this.textEditor.focus();
            _this.EditEvents.dispatch(EditorEvents.CHANGED, _this.file);
        })
            .catch(function (err) {
            EBW.Error(err);
        });
    };
    RepoFileEditorCM$$1.prototype.File = function () {
        return this.file;
    };
    RepoFileEditorCM$$1.prototype.Rename = function (name) {
        var _this = this;
        return this.file.Rename(name)
            .then(function () {
            console.log("Rename is concluded: this.file = ", _this.file);
            var list = document.querySelectorAll("[ebw-bind=\"current-filename\"]");
            for (var i = 0; i < list.length; i++) {
                var e = list.item(i);
                e.textContent = name;
            }
            return Promise.resolve();
        });
    };
    RepoFileEditorCM$$1.prototype.setBoundFilenames = function () {
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
    RepoFileEditorCM$$1.prototype.showImageEditor = function () {
        this.$.textEditor.style.display = 'none';
        this.$.imageEditor.style.display = 'block';
    };
    RepoFileEditorCM$$1.prototype.showTextEditor = function () {
        this.$.textEditor.style.display = 'block';
        this.$.imageEditor.style.display = 'none';
    };
    return RepoFileEditorCM$$1;
}(RepoFileEditorCM));

var FSFileEdit = (function () {
    function FSFileEdit(fc, FS) {
        this.fc = fc;
        this.FS = FS;
        this.DirtySignal = new signals.Signal();
        this.EditingSignal = new signals.Signal();
    }
    FSFileEdit.prototype.SetFileContent = function (fc) {
        this.fc = fc;
    };
    FSFileEdit.prototype.FileContent = function () {
        return this.fc;
    };
    FSFileEdit.prototype.Revert = function () {
        var _this = this;
        return this.FS.Revert(this.fc.Name)
            .then(function (fc) {
            _this.fc = fc;
            return Promise.resolve(fc);
        });
    };
    FSFileEdit.prototype.Rename = function (toPath) {
        var _this = this;
        var oldName = this.fc.Name;
        return this.FS.Rename(this.fc.Name, toPath)
            .then(function (_a) {
            var fOld = _a[0], fNew = _a[1];
            _this.FS.Sync(oldName);
            _this.fc = fNew;
            _this.Sync();
            // this.signalDirty();
            return Promise.resolve([fOld, fNew]);
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
    FSFileEdit.prototype.IsDeleted = function () {
        return this.fc.Stat == FileStat.Deleted;
    };
    FSFileEdit.prototype.IsEditing = function () {
        return this.editing;
    };
    FSFileEdit.prototype.IsDirty = function () {
        return this.FS.IsDirty(this.fc.Name);
    };
    FSFileEdit.prototype.signalDirty = function () {
        var _this = this;
        this.IsDirty().then(function (dirty) {
            _this.DirtySignal.dispatch(_this, dirty);
        });
    };
    FSFileEdit.prototype.Save = function (t, fs) {
        var _this = this;
        // If FileStat is Changed, or Deleted, we want to keep 
        // that stat.
        if (!fs) {
            fs = this.fc.Stat;
            if (fs == FileStat.New || fs == FileStat.Exists || fs == FileStat.NotExist) {
                fs = FileStat.Changed;
            }
        }
        return this.FS.Write(this.fc.Name, fs, t)
            .then(function (fc) {
            _this.fc = fc;
            _this.signalDirty();
            return Promise.resolve(fc);
        });
    };
    FSFileEdit.prototype.Sync = function () {
        var _this = this;
        return this.FS.Sync(this.fc.Name)
            .then(function (fcs) {
            var fc = fcs[0];
            _this.fc = fc;
            return Promise.resolve(fc);
        });
    };
    FSFileEdit.prototype.GetText = function () {
        var _this = this;
        if (this.fc.Content) {
            return Promise.resolve(this.fc.Content);
        }
        return this.FS.Read(this.fc.Name)
            .then(function (fc) {
            console.log("FSFileEdit.FS.Read returned ", fc);
            _this.fc = fc;
            return Promise.resolve(fc.Content);
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
                _this.editor.Rename(toName)
                    .then(function () {
                    _this.dialog.Close();
                })
                    .catch(EBW.Error);
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
            .then(function (_a) {
            var fOld = _a[0], fNew = _a[1];
            _this.Listeners.dispatch(fromPath, fOld);
            _this.Listeners.dispatch(toPath, fNew);
            return Promise.resolve([fOld, fNew]);
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
    FSNotify.prototype.Sync = function (path) {
        var _this = this;
        return this.source.Sync(path)
            .then(function (fcs) {
            for (var _i = 0, fcs_1 = fcs; _i < fcs_1.length; _i++) {
                var fc = fcs_1[_i];
                _this.Listeners.dispatch(fc.Name, fc);
            }
            return Promise.resolve(fcs);
        });
    };
    //=============================================================
    //======= all methods below this point simply pass their calls
    //======= to the underlying FS, and don't require notification.
    //=============================================================
    FSNotify.prototype.RepoOwnerName = function () { return this.source.RepoOwnerName(); };
    FSNotify.prototype.Stat = function (path) { return this.source.Stat(path); };
    FSNotify.prototype.Read = function (path) { return this.source.Read(path); };
    FSNotify.prototype.IsDirty = function (path) { return this.source.IsDirty(path); };
    return FSNotify;
}());

var FSOverlay = (function () {
    function FSOverlay(below, above) {
        this.below = below;
        this.above = above;
        this.changes = new Set();
    }
    FSOverlay.prototype.IsDirty = function (path) {
        var _this = this;
        return this.above.Stat(path)
            .then(function (aboveStat) {
            if (aboveStat == FileStat.Exists || aboveStat == FileStat.NotExist) {
                return Promise.resolve(false);
            }
            if (aboveStat == FileStat.New) {
                return Promise.resolve(true);
            }
            return _this.below.Stat(path)
                .then(function (belowStat) {
                switch (belowStat) {
                    case FileStat.NotExist:
                    //fallthrough
                    case FileStat.Changed:
                    //fallthrough
                    case FileStat.New:
                    //fallthrough
                    case FileStat.NotExist:
                        return Promise.resolve(true);
                }
                return Promise.all([_this.above.Read(path), _this.below.Read(path)])
                    .then(function (fcs) {
                    var aboveC = fcs[0], belowC = fcs[1];
                    // console.log(`FSOverlay.IsDirty(${path}): aboveC =`);
                    // console.log(aboveC);
                    // console.log(`belowC = `);
                    // console.log(belowC);
                    // console.log(`Resolving aboveC.Content!=belowC.Content = `,
                    // aboveC.Content != belowC.Content);
                    if (!aboveC.Content) {
                        return Promise.resolve(false);
                    }
                    return Promise.resolve(aboveC.Content != belowC.Content);
                });
            });
        });
    };
    FSOverlay.prototype.RepoOwnerName = function () {
        return this.below.RepoOwnerName();
    };
    FSOverlay.prototype.Stat = function (path) {
        var _this = this;
        return this.above.Stat(path)
            .then(function (s) {
            if (FileStat.NotExist == s) {
                return _this.below.Stat(path);
            }
            return Promise.resolve(s);
        });
    };
    FSOverlay.prototype.Read = function (path) {
        var _this = this;
        return this.above.Stat(path)
            .then(function (s) {
            switch (s) {
                case FileStat.Exists:
                    return _this.readAndCachePath(path);
                case FileStat.Changed:
                //fallthrough
                case FileStat.New:
                //fallthrough
                case FileStat.Deleted:
                    return _this.above.Read(path);
                case FileStat.NotExist:
                    return _this.below.Read(path)
                        .then(function (c) {
                        _this.above.Write(path, c.Stat, c.Content);
                        return Promise.resolve(c);
                    });
            }
        });
    };
    FSOverlay.prototype.readAndCachePath = function (path) {
        var _this = this;
        return this.above.Read(path)
            .then(function (fc) {
            if (fc.Content) {
                return Promise.resolve(fc);
            }
            return _this.below.Read(path)
                .then(function (fc) {
                return _this.above.Write(path, fc.Stat, fc.Content);
            });
        });
    };
    FSOverlay.prototype.Write = function (path, stat, content) {
        var _this = this;
        return this.above.Write(path, stat, content)
            .then(function (fc) {
            console.log("FSOverlay.Write(" + path + "): stat = " + stat);
            if (!(fc.Stat == FileStat.Exists || fc.Stat == FileStat.NotExist)) {
                _this.changes.add(path);
            }
            return Promise.resolve(fc);
        });
    };
    FSOverlay.prototype.Remove = function (path, stat) {
        var _this = this;
        return this.above.Remove(path, stat)
            .then(function (fc) {
            _this.changes.add(path);
            return Promise.resolve(fc);
        });
    };
    FSOverlay.prototype.Rename = function (fromPath, toPath) {
        var _this = this;
        return this.above.Rename(fromPath, toPath)
            .then(function (_a) {
            var fOld = _a[0], fNew = _a[1];
            console.log("FSOverlay.Rename.then : fOld, fNew = ", fOld, fNew);
            _this.changes.add(fromPath);
            _this.changes.add(toPath);
            return Promise.resolve([fOld, fNew]);
        });
    };
    FSOverlay.prototype.Revert = function (path) {
        var _this = this;
        // @TODO NEED TO CONSIDER THE ISSUES AROUND REVERTING
        // VIA ORIGINALNAME...
        return this.above.Read(path)
            .then(function (c) {
            return _this.below.Read(c.OriginalName());
        })
            .then(function (c) {
            return _this.above.Write(path, c.Stat, c.Content);
        })
            .then(function (fc) {
            // We're reverted path, so it's not longer
            // changed.
            _this.changes.delete(path);
            return _this.above.Read(path);
        });
    };
    FSOverlay.prototype.Sync = function (path) {
        var _this = this;
        // If we're given a path name, then we work with
        // that path only. If we' are not given a path,
        // we synchronised all changed files.
        if (path) {
            return this.above.Read(path)
                .then(function (fc) {
                switch (fc.Stat) {
                    case FileStat.New:
                    // fallthrough
                    case FileStat.Changed:
                        return _this.below.Write(fc.Name, fc.Stat, fc.Content);
                    case FileStat.Deleted:
                    // fallthrough
                    case FileStat.NotExist:
                        return _this.below.Remove(fc.Name, fc.Stat);
                }
                return Promise.resolve(fc);
            })
                .then(function (fc) {
                return _this.above.Write(fc.Name, fc.Stat, fc.Content);
            })
                .then(function (fc) {
                _this.changes.delete(path);
                console.log("Returning from FSOverlay single-file sync: fc = ", fc);
                return Promise.resolve([fc]);
            });
        }
        // We do two passes through our changes list, first
        // doing all Writes then doing all Deletes. Therefore,
        // if any writes fail, the deletes aren't executed, which
        // can be valuable when managing renames.
        var writePromises = new Array();
        var _loop_1 = function (p) {
            writePromises.push(this_1.above.Read(p)
                .then(function (fc) {
                if (fc.Stat == FileStat.New || fc.Stat == FileStat.Changed) {
                    return _this.below.Write(p, fc.Stat, fc.Content);
                }
                else {
                    return Promise.resolve(fc);
                }
            })
                .then(function (fc) {
                if (fc) {
                    return _this.above.Write(p, fc.Stat, fc.Content);
                }
                else {
                    return Promise.resolve(fc);
                }
            }));
        };
        var this_1 = this;
        for (var _i = 0, _a = this.changes; _i < _a.length; _i++) {
            var p = _a[_i];
            _loop_1(p);
        }
        return Promise.all(writePromises)
            .then(function (fcsP) {
            var removePromises = [];
            for (var _i = 0, fcsP_1 = fcsP; _i < fcsP_1.length; _i++) {
                var fc = fcsP_1[_i];
                if (fc.Stat == FileStat.Deleted || fc.Stat == FileStat.NotExist) {
                    removePromises.push(_this.below.Remove(fc.Name)
                        .then(function (fc) {
                        return _this.above.Remove(fc.Name, fc.Stat);
                    }));
                }
                else {
                    removePromises.push(Promise.resolve(fc));
                }
            }
            return Promise.all(removePromises);
        })
            .then(function (fcs) {
            // We're synced, so there are not more changes
            _this.changes.clear();
            return Promise.resolve(fcs);
        });
    };
    return FSOverlay;
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
            return _this.Read(toPath)
                .then(function (fNew) {
                var fOld = new FileContent(fromPath, FileStat.NotExist);
                return Promise.resolve([fOld, fNew]);
            });
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
    FSRemote.prototype.IsDirty = function (path) { return Promise.reject("FSRemote doesn't support IsDirty"); };
    return FSRemote;
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
        return Promise.resolve([f, t]);
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
    FSSession.prototype.IsDirty = function (path) { return Promise.reject("FSSession doesn't support IsDirty"); };
    return FSSession;
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
            console.log("ReadCache.Remove received " + path + ": stat = ", fc.Stat);
            return _this.cache.Remove(path, fc.Stat)
                .then(function (rfc) {
                console.log("ReadCache.Remove returning ", rfc);
                return Promise.resolve(rfc);
            });
        });
    };
    FSReadCache.prototype.Rename = function (fromPath, toPath) {
        var _this = this;
        return this.source.Rename(fromPath, toPath).then(function (_a) {
            var fOld = _a[0], fNew = _a[1];
            return _this.cache.Write(toPath, fNew.Stat, fNew.Content)
                .then(function (_) {
                return _this.cache.Remove(fromPath, fOld.Stat);
            })
                .then(function (_) {
                return Promise.resolve([fOld, fNew]);
            });
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
    FSReadCache.prototype.IsDirty = function (path) { return Promise.reject("FSReadCache doesn't support IsDirty"); };
    return FSReadCache;
}());

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
        // This method will be triggered by FSFileList.
        // this.FS.Listeners.add(this.FSEvent, this);
        AddToParent(parent, _this.el);
        return _this;
    }
    FSFileList_File$$1.prototype.FSEvent = function (path, fc) {
        var _this = this;
        // console.log(`In FSFileList_File.FSEvent(${path}) - stat = ${fc.Stat}`)
        if (path != this.file.Name) {
            // If path's don't match, this doesn't affect us.
            return;
        }
        switch (fc.Stat) {
            case FileStat.Changed:
                this.FS.IsDirty(this.file.Name)
                    .then(function (dirty) {
                    if (dirty) {
                        _this.el.classList.add('changed');
                    }
                    else {
                        _this.el.classList.remove('changed');
                    }
                });
                this.el.classList.remove("removed");
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
        if (!fc) {
            debugger;
        }
        // console.log(`FSFileList.FSEvent -- fileContent = `, fc);
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
                // Nothing to do - filelist_file will handle
                // css style change.
                break;
            case FileStat.NotExist:
                if (f) {
                    this.files.delete(fc.Name);
                }
                break;
        }
        // Trigger the FSFileList_File FSEvent callback.
        if (f) {
            f.FSEvent(path, fc);
        }
    };
    FSFileList.prototype.newFile = function (fc) {
        var _this = this;
        var f = new FSFileList_File$1(this.parent, fc, this.FS, {
            clickFile: function (evt) {
                _this.FS.Read(fc.Name)
                    .then(function (fc) {
                    var edit = new FSFileEdit(fc, _this.FS);
                    _this.editor.setFile(edit);
                });
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
        sessionStorage.clear();
        this.repoOwner = repoOwner;
        this.repoName = repoName;
        this.editor = undefined;
        this.editor = new RepoFileEditorCM$1(repoOwner, repoName, document.getElementById('editor'), {
            Rename: function () {
                return;
            }
        });
        var remoteFS = new FSReadCache(new FSRemote(this.repoOwner, this.repoName));
        var localFS = new FSSession("temp-rootf", this.repoOwner, this.repoName);
        var overlayFS = new FSOverlay(remoteFS, localFS);
        this.FS = new FSNotify(overlayFS);
        new FSFileList(filesList, this.editor, this.FS, this.proseIgnoreFunction);
        new RepoEditorPage_NewFileDialog$1(document.getElementById('repo-new-file'), this.FS, this.editor);
        new RepoEditorPage_RenameFileDialog$1(document.getElementById("editor-rename-button"), this.FS, this.editor);
        new ControlTag(document.getElementById("files-show-tag"), function (showing) {
            document.getElementById("new-editor-files-nav")
                .style.width = showing ? "20%" : "0px";
            document.getElementById("repo-file-actions")
                .style.visibility = showing ? "visible" : "hidden";
            var f = document.getElementById("page-footer");
            f.style.display = showing ? 'flex' : 'none';
            console.log("set footer = ", f);
        });
        FSPrimeFromJS(this.FS, filesJson);
        document.getElementById("repo-print-printer").addEventListener('click', function (evt) {
            evt.preventDefault();
            evt.stopPropagation();
            console.log("Starting printing...");
            EBW.Toast("Creating your PDF. We'll open it in a new tab when it's ready.");
            new PrintListener(_this.repoOwner, _this.repoName, "book", "print");
        });
        document.getElementById("repo-print-screen").addEventListener("click", function (evt) {
            evt.preventDefault();
            evt.stopPropagation();
            EBW.Toast("Creating your PDF. We'll open it in a new tab when it's ready.");
            new PrintListener(_this.repoOwner, _this.repoName, "book", "screen");
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

var FileStatus = (function () {
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

var FileContent$1 = (function () {
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
var File$1 = (function () {
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
            var workingExists = _a[0], working = _a[1], theirExists = _a[2], their = _a[3];
            var workingFile = new FileContent$1(workingExists, working);
            var theirFile = new FileContent$1(theirExists, their);
            _this.cache.set("working", workingFile);
            _this.cache.set("their", theirFile);
            _this.ListenRPC.dispatch(source, false, "FetchContent");
            _this.Listen.dispatch(source, FileEvent.WorkingChanged, workingFile);
            _this.Listen.dispatch(source, FileEvent.TheirChanged, theirFile);
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
            return Promise.resolve(new FileContent$1(exists, raw));
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
        var fc = new FileContent$1(false, "");
        this.cache.set("working", fc);
        this.Listen.dispatch(source, FileEvent.WorkingChanged, fc);
        // Don't need to delete on server as this will happen on file save
    };
    File.prototype.RemoveTheirFile = function (source) {
        var fc = new FileContent$1(false, "");
        this.cache.set("their", new FileContent$1(false, ""));
        this.Listen.dispatch(source, FileEvent.TheirChanged, fc);
        // Don't need to delete on server as this will happen on file save
    };
    File.prototype.SetWorkingContent = function (source, content) {
        var fc = new FileContent$1(content != undefined, content);
        this.cache.set("working", fc);
        this.Listen.dispatch(source, FileEvent.WorkingChanged, fc);
    };
    File.prototype.SetTheirContent = function (source, content) {
        var fc = new FileContent$1(content != undefined, content);
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

var FileList = (function () {
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
var FileDisplay = (function (_super) {
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
                this.el.classList.remove("status-new", "status-modified", "status-resolved", "status-deleted");
                this.el.classList.add("status-" + this.file.Status());
                break;
        }
    };
    FileDisplay.prototype.rpcEvent = function (source, inProgress, method) {
        console.log("RPC Event for " + this.file.Path() + " inProgress = " + inProgress + ", method = " + method);
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
var FileListDisplay = (function (_super) {
    tslib_1.__extends(FileListDisplay, _super);
    function FileListDisplay(context, parent, fileList, mergingInfo) {
        var _this = _super.call(this) || this;
        _this.context = context;
        _this.parent = parent;
        _this.mergingInfo = mergingInfo;
        _this.Listen = new signals.Signal();
        fileList.Listen.add(_this.fileListEvent, _this);
        if (_this.mergingInfo.IsPRMerge()) {
            _this.el.classList.add("pr-merge");
        }
        else {
            _this.el.classList.add("not-pr-merge");
        }
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
var MergeEditorControlBar = (function () {
    function MergeEditorControlBar() {
        var _this = this;
        this.Listen = new signals.Signal();
        this.DeleteButton = this.get("delete");
        this.SaveButton = this.get("save");
        this.RevertOurButton = this.get("revert-our");
        this.RevertTheirButton = this.get("revert-their");
        this.CopyWorkingButton = this.get("copy-working");
        this.CopyTheirButton = this.get("copy-their");
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
        if (f.WorkingFile().Exists || f.TheirFile().Exists) {
            // One or the other exists
            this.DeleteButton.removeAttribute("disabled");
        }
        else {
            this.DeleteButton.setAttribute("disabled", "disabled");
        }
    };
    return MergeEditorControlBar;
}());

var MergeEditor$1 = (function () {
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
                    .catch(EBW.Error);
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
                    EBW.Toast("Resolved changes on " + _this.file.Path());
                })
                    .catch(EBW.Error);
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
        return new FileContent$1(this.isWorkingDeleted(), this.getWorkingText());
    };
    MergeEditor.prototype.getTheirContent = function () {
        return new FileContent$1(this.isTheirDeleted(), this.getTheirText());
    };
    MergeEditor.prototype.CopyTheir = function () {
        // We leave source undefined, so that our editor will update
        // when the change arrives		
        console.log("isTheirDeleted = " + this.isTheirDeleted() + ", text = " + this.getTheirText());
        this.file.SetWorkingContent(undefined, this.isTheirDeleted() ? undefined : this.getTheirText());
    };
    MergeEditor.prototype.CopyWorking = function () {
        // We leave source undefined, so that our editor will update
        // when the change arrives
        console.log("isWorkingDeleted = " + this.isWorkingDeleted());
        console.log("working text = " + this.getTheirText());
        this.file.SetTheirContent(undefined, this.isWorkingDeleted() ? undefined : this.getWorkingText());
    };
    MergeEditor.prototype.RevertOur = function () {
        // Leave source undefined so that our editor updates when
        // changes arrive.
        this.file.RevertOur(undefined)
            .catch(EBW.Error);
    };
    MergeEditor.prototype.RevertTheir = function () {
        // Leave source undefined so that our editor updates when
        // changes arrive.	
        this.file.RevertTheir(undefined)
            .catch(EBW.Error);
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
        if (this.file) {
            var f_1 = this.file;
            var w = this.getWorkingText();
            // We pass ourselves as the source, so that we don't update
            // our editor when the change event arrives
            this.file.SetWorkingContent(this, this.isWorkingDeleted() ? undefined : this.getWorkingText());
            this.file.SetTheirContent(this, this.isTheirDeleted() ? undefined : this.getTheirText());
            return this.file.Save()
                .then(function () {
                EBW.Toast("Saved " + f_1.Path());
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
        console.log("Merge: " + file.Path());
        if (this.file && this.file.Path() == file.Path()) {
            return; // Nothing to do if we're selecting the same file
        }
        // Save any file we're currently editing
        if (this.file) {
            this.SaveFile();
            this.file.Listen.remove(this.FileEventListener, this);
        }
        // Controls must receive update before we do.
        // TODO : Actually, the controls should listen to US, not to the
        // file, and we should have an 'EditorStateModel'...
        this.controls.SetFile(file);
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
        });
    };
    return MergeEditor;
}());

var MergeInstructions = (function (_super) {
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

var CommitMessageDialog$1 = (function (_super) {
    tslib_1.__extends(CommitMessageDialog$$1, _super);
    function CommitMessageDialog$$1(clearOnOpen) {
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
    CommitMessageDialog$$1.prototype.dialogEvent = function (evt) {
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
    CommitMessageDialog$$1.prototype.Open = function (title, instructions) {
        var _this = this;
        this.$.title.innerText = title;
        this.$.instructions.innerText = instructions;
        return new Promise(function (resolve, reject) {
            _this.resolve = resolve;
            _this.dialog.Open();
        });
    };
    return CommitMessageDialog$$1;
}(CommitMessageDialog));

var ClosePRDialog = (function (_super) {
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
                if (this.clearOnOpen) {
                }
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
var MergingInfo = (function () {
    function MergingInfo(dataEl) {
        if (!dataEl) {
            dataEl = document.getElementById("merging-info");
            var js = JSON.parse(dataEl.innerText);
            this.PRNumber = js.MergingPRNumber;
            this.Description = js.MergingDescription;
        }
    }
    MergingInfo.prototype.IsPRMerge = function () {
        return (0 < this.PRNumber);
    };
    return MergingInfo;
}());

var RepoConflictPage = (function () {
    function RepoConflictPage(context) {
        var _this = this;
        this.context = context;
        this.mergingInfo = new MergingInfo(document.getElementById("merging-info"));
        this.closePRDialog = new ClosePRDialog(false);
        var fileList = new FileList(context);
        var fileListDisplay = new FileListDisplay(context, document.getElementById("staged-files-list"), fileList, this.mergingInfo);
        fileListDisplay.el.addEventListener("file-click", function (evt) {
            _this.fileListEvent(undefined, evt.detail.file);
        });
        this.editor = new MergeEditor$1(context, document.getElementById("editor-work"));
        this.commitDialog = new CommitMessageDialog$1(false);
        new MergeInstructions(document.getElementById('merge-instructions'), this.editor);
        new ControlTag(document.getElementById("files-show-tag"), function (showing) {
            var el = document.getElementById("files");
            if (showing)
                el.classList.add("showing");
            else
                el.classList.remove("showing");
            // el
            // .style.width = showing ? "30em":"0px";
        });
        var filesEl = document.getElementById('staged-files-data');
        if (!filesEl) {
            EBW.Error("FAILED TO FIND #staged-files-data: cannot instantiate RepoConflictPage");
            return;
        }
        var listjs = filesEl.innerText;
        fileList.load(JSON.parse(listjs));
        document.getElementById("action-commit").addEventListener("click", function (evt) {
            evt.preventDefault();
            evt.stopPropagation();
            _this.commitDialog.Open("Resolve Conflict", "The merge will be resolved.")
                .then(function (r) {
                if (r.Cancelled) {
                    return;
                }
                console.log("Result= ", r);
                _this.context.RepoRedirect("conflict/resolve", new Map([["message", r.Message], ["notes", r.Notes]]));
                return;
            })
                .catch(EBW.Error);
        });
        document.getElementById("action-abort").addEventListener("click", function (evt) {
            evt.preventDefault();
            evt.stopPropagation();
            if (_this.mergingInfo.IsPRMerge()) {
                _this.closePRDialog.Open("Close PR", "You have been merging PR " + _this.mergingInfo.PRNumber + ".\n\t\t\t\t\tDo you want to close the PR?", { Close: false, CloseMessage: "", Cancelled: false })
                    .then(function (r) {
                    if (r.Cancelled) {
                        return;
                    }
                    _this.context.RepoRedirect("conflict/abort", new Map([["message", r.CloseMessage],
                        ["close", r.Close]]));
                    return;
                })
                    .catch(EBW.Error);
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

var MergeEditor$2 = (function (_super) {
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

var EBW = (function () {
    function EBW() {
        if (null == EBW.instance) {
            EBW.instance = this;
            this.api = new APIWs();
            console.log("Activating foundation on the document");
            jQuery(document).foundation();
            var el = document.getElementById("ebw-context");
            var context = void 0;
            if (el) {
                context = new Context(el, el.getAttribute("data-repo-owner"), el.getAttribute("data-repo-name"));
                switch (el.getAttribute('data-page')) {
                    case 'RepoDetailPage':
                        new RepoDetailPage(context);
                        break;
                    case 'RepoConflictPage':
                        new RepoConflictPage(context, el);
                        break;
                }
            }
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
