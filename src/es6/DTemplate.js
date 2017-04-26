
let DTemplate = (function() {
	

	let templates =
		{"AddNewBookDialog":"\u003cdiv\u003e\n\t\u003cdiv data-set=\"chooseType\"\u003e\n\t\t\u003ch1\u003eAdd a New Book\u003c/h1\u003e\n\t\t\u003cfieldset\u003e\n\t\t\t\u003clabel\u003e\n\t\t\t\t\u003cinput type=\"radio\" value=\"new\" data-set=\"newBookRadio\" /\u003e\n\t\t\t\tStart an new book.\n\t\t\t\u003c/label\u003e\n\t\t\t\u003clabel\u003e\n\t\t\t\t\u003cinput type=\"radio\" value=\"collaborate\"\n\t\t\t\tdata-set=\"collaborateRadio\" /\u003e\n\t\t\t\tCollaborate on an existing book.\n\t\t\t\u003c/label\u003e\n\t\t\u003c/fieldset\u003e\n\t\t\u003cbutton data-event=\"click:choseType\" class=\"btn\"\u003eNext\u003c/button\u003e\n\t\u003c/div\u003e\n\t\u003cdiv data-set=\"newBook\" style=\"display: none;\"\u003e\n\t\t\u003ch1\u003eNew Book\u003c/h1\u003e\n\t\t\u003cform method=\"post\" action=\"/github/create/new\"\u003e\n\t\t\u003cinput type=\"hidden\" name=\"action\" value=\"new\" /\u003e\n\t\t\u003clabel\u003eEnter the name for your new book.\n\t\t\u003cinput type=\"text\" name=\"repo_new\" placeholder=\"e.g. MobyDick\" data-set=\"repo_name\"/\u003e\n\t\t\u003c/label\u003e\n\t\t\u003cinput type=\"submit\" class=\"btn\" value=\"New Book\"/\u003e\n\t\t\u003c/form\u003e\n\t\u003c/div\u003e\n\t\u003cdiv data-set=\"collaborate\"\u003e\n\t\t\u003ch1\u003eCollaborate\u003c/h1\u003e\n\t\t\u003cform method=\"post\" action=\"/github/create/fork\"\u003e\n\t\t\u003cinput type=\"hidden\" name=\"action\" value=\"fork\" /\u003e\n\t\t\u003clabel\u003eEnter the owner and repo for the book you will collaborate on.\n\t\t\u003cinput type=\"text\" name=\"collaborate_repo\" placeholder=\"e.g. electricbooks/core\" data-set=\"collaborate_repo\" /\u003e\n\t\t\u003c/label\u003e\n\t\t\u003cinput type=\"submit\" class=\"btn\" value=\"Collaborate\" /\u003e\n\t\t\u003c/form\u003e\n\t\u003c/div\u003e\n\u003c/div\u003e\n","AllFilesEditor":"\u003cul data-set=\"filesList\" class=\"files-list\"\u003e\n\u003c/ul\u003e\n","MergeEditor":"\u003cdiv class=\"merge-editor\"\u003e\n\t\u003cdiv class=\"action-group\"\u003e\n\t\t\u003cbutton data-event=\"click:save\" class=\"btn\"\u003eSave\u003c/button\u003e\n\t\u003c/div\u003e\n\t\u003cdiv class=\"merge-mergely\" data-set=\"mergely\"\u003e\n\t\u003c/div\u003e\n\u003c/div\u003e","PullRequestDiffList":"\u003cdiv\u003e\n\t\u003cul data-set=\"list\"\u003e\n\t\u003c/ul\u003e\n\t\u003cbutton data-set=\"closePR\"\u003e\u003ci class=\"fa fa-check\"\u003e \u003c/i\u003e\u003c/button\u003e\n\u003c/div\u003e","PullRequestLink":"\u003cdiv class=\"pull-request-link\"\u003e\n\t\u003ca href=\"#\" data-set=\"link\"\u003e_\u003c/a\u003e\n\u003c/div\u003e","RepoFileEditLink":"\u003cul\u003e\n\t\u003cli class=\"edit-link\" data-set=\"this\" data-event=\"click\"\u003e\n\t\t\u003cspan class=\"file-dirty-tag\"\u003e\u003ci data-set=\"editing\" class=\"fa fa-pencil\"\u003e \u003c/i\u003e\u003c/span\u003e\n\t\t\u003ca href=\"#\"\u003e\u003cspan data-set=\"name\"\u003e \u003c/span\u003e\u003c/a\u003e\n\t\u003c/li\u003e\n\u003c/ul\u003e\n","RepoFileEditor_ace":"\u003cdiv class=\"repo-file-editor-workspace\"\u003e\t\n\t\u003cdiv class=\"toolbar-menu\"\u003e\n\t\t\u003cbutton data-event=\"click:save\" data-set=\"save\"\u003e\u003ci class=\"fa fa-save\"\u003e \u003c/i\u003e\u003c/button\u003e\n\t\t\u003cbutton data-event=\"click:undo\" data-set=\"undo\"\u003e\u003ci class=\"fa fa-undo\"\u003e \u003c/i\u003e\u003c/button\u003e\n\t\t\u003cdiv class=\"spacer\"\u003e \u003c/div\u003e\n\t\t\u003cbutton data-event=\"click:delete\"\u003e\u003ci class=\"fa fa-trash\"\u003e \u003c/i\u003e\u003c/button\u003e\n\t\u003c/div\u003e\n\t\u003cdiv class=\"repo-file-editor repo-file-editor-ace\" data-set=\"editor\"\u003e\n\t\u003c/div\u003e\n\u003c/div\u003e","RepoFileEditor_codemirror":"\u003cdiv class=\"repo-file-editor-workspace\"\u003e\n\t\u003cdiv class=\"repo-file-editor\" data-set=\"editor\"\u003e\n\t\u003c/div\u003e\n\u003c/div\u003e\n","RepoFileList":"\u003cdiv class=\"repo-file-list\"\u003e\n\t\u003cdiv class=\"menu-header repo-files\"\u003e\n\t\t\u003ch2 class=\"menu-title\"\u003eFiles\u003c/h2\u003e\n\t\u003c/div\u003e\n\t\u003cul class=\"action-group\" id=\"files\" data-set=\"fileList\"\u003e\n\t\u003c/ul\u003e\n\t\u003cbutton data-event='click:click-new'\u003eAdd new file\u003c/button\u003e\n\u003c/div\u003e\n"};

	let mk = function(k, html) {
		let el = document.createElement('div');
		el.innerHTML = html;

		let c = el.firstElementChild;
		while ((null!=c) && (Node.ELEMENT_NODE!=c.nodeType)) {
			c = c.nextSibling;
		}
		if (null==c) {
			console.error("FAILED TO FIND ANY ELEMENT CHILD OF ", k, ":", el)
			return mk('error', '<em>No child elements in template ' + k + '</em>');
		}
		el = c;
		let et = el.querySelector('[data-set="this"]');
		if (null!=et) {
			el = et;
			el.removeAttribute('data-set');
		}
		return el;
	}

	for (let i in templates) {
		templates[i] = mk(i, templates[i]);
	}

	return function(t, dest={}) {
		// Return a deep copy of the node
		let n = templates[t].cloneNode(true);
		try {
			for (let el of QuerySelectorAllIterate(n, '[data-set]')) {
				let a = el.getAttribute('data-set');
				if (a.substr(0,1)=='$') {
					a = a.substr(1);
					el = jQuery(el);
				}
				dest[a] = el;
			}
		} catch (err) {
			console.error("ERROR in DTemplate(" + t + "): ", err);
			debugger;
		}
		return [n,dest];
	}
})();
