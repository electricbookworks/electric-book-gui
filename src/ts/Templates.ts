// dtemplate generated - do not edit
export namespace EL {
	export type AddNewBookDialog =	HTMLDivElement;
	export type AllFiles_File =	HTMLUListElement;
	export type FoundationRevealDialog =	HTMLDivElement;
	export type MergeEditor =	HTMLDivElement;
	export type PullRequestDiffList_File =	HTMLUListElement;
	export type RepoFileEditLink =	HTMLUListElement;
	export type RepoFileEditor_codemirror =	HTMLDivElement;
	export type RepoPageEditor_NewFileDialog =	HTMLDivElement;
	export type RepoPageEditor_RenameFileDialog =	HTMLDivElement;
	
}
export namespace R {
	export interface AddNewBookDialog {
		chooseType: HTMLDivElement,
		newBookRadio: HTMLInputElement,
		collaborateRadio: HTMLInputElement,
		newBook: HTMLDivElement,
		repo_name: HTMLInputElement,
		collaborate: HTMLDivElement,
		collaborate_repo: HTMLInputElement,
		};
	export interface AllFiles_File {
		name: HTMLDivElement,
		};
	export interface FoundationRevealDialog {
		content: HTMLDivElement,
		};
	export interface MergeEditor {
		mergely: HTMLDivElement,
		};
	export interface PullRequestDiffList_File {
		};
	export interface RepoFileEditLink {
		editing: HTMLUnknownElement,
		name: HTMLSpanElement,
		};
	export interface RepoFileEditor_codemirror {
		editor: HTMLDivElement,
		};
	export interface RepoPageEditor_NewFileDialog {
		error: HTMLDivElement,
		filename: HTMLInputElement,
		};
	export interface RepoPageEditor_RenameFileDialog {
		error: HTMLDivElement,
		current_name: HTMLSpanElement,
		filename: HTMLInputElement,
		};
	
}	// end namespace R
export class AddNewBookDialog {
	public static _template : HTMLDivElement;
	public el : HTMLDivElement;
	public $ : R.AddNewBookDialog;
	constructor() {
		let t = AddNewBookDialog._template;
		if (! t ) {
			let d = document.createElement('div');
			d.innerHTML = `<div><div><h1>Add a New Book</h1><fieldset><label><input type="radio" value="new"/>
				Start a new book.
			</label><label><input type="radio" value="collaborate"/>
				Collaborate on an existing book.
			</label></fieldset><button data-event="click:choseType" class="btn">Next</button></div><div><h1>New Book</h1><form method="post" action="/github/create/new"><input type="hidden" name="action" value="new"/><label>Enter the name for your new book.
		<input type="text" name="repo_new" placeholder="e.g. MobyDick"/>
		</label><input type="submit" class="btn" value="New Book"/></form></div><div><h1>Collaborate</h1><form method="post" action="/github/create/fork"><input type="hidden" name="action" value="fork"/><label>Enter the owner and repo for the book you will collaborate on.
		<input type="text" name="collaborate_repo" placeholder="e.g. electricbooks/core"/>
		</label><input type="submit" class="btn" value="Collaborate"/></form></div></div>`;
			t = d.firstElementChild as HTMLDivElement;
			AddNewBookDialog._template = t;
		}
		let n = t.cloneNode(true) as HTMLDivElement;
		this.$ = {
			chooseType: n.childNodes[0] as HTMLDivElement,
			newBookRadio: n.childNodes[0].childNodes[1].childNodes[0].childNodes[0] as HTMLInputElement,
			collaborateRadio: n.childNodes[0].childNodes[1].childNodes[1].childNodes[0] as HTMLInputElement,
			newBook: n.childNodes[1] as HTMLDivElement,
			repo_name: n.childNodes[1].childNodes[1].childNodes[1].childNodes[1] as HTMLInputElement,
			collaborate: n.childNodes[2] as HTMLDivElement,
			collaborate_repo: n.childNodes[2].childNodes[1].childNodes[1].childNodes[1] as HTMLInputElement,
		};
		this.el = n;
	}
}
export class AllFiles_File {
	public static _template : HTMLUListElement;
	public el : HTMLUListElement;
	public $ : R.AllFiles_File;
	constructor() {
		let t = AllFiles_File._template;
		if (! t ) {
			let d = document.createElement('div');
			d.innerHTML = `<ul><li data-set="this" class="allfiles-file"><div data-event="click:clickName">NAME
		</div></li></ul>`;
			t = d.firstElementChild.childNodes[0] as HTMLUListElement;
			AllFiles_File._template = t;
		}
		let n = t.cloneNode(true) as HTMLUListElement;
		this.$ = {
			name: n.childNodes[0] as HTMLDivElement,
		};
		this.el = n;
	}
}
export class FoundationRevealDialog {
	public static _template : HTMLDivElement;
	public el : HTMLDivElement;
	public $ : R.FoundationRevealDialog;
	constructor() {
		let t = FoundationRevealDialog._template;
		if (! t ) {
			let d = document.createElement('div');
			d.innerHTML = `<div class="reveal" id="new-file-dialog" data-reveal=""><div class="content">
	</div><button class="close-button" aria-label="Close popup" type="button" data-close=""><span aria-hidden="true">×</span></button></div>`;
			t = d.firstElementChild as HTMLDivElement;
			FoundationRevealDialog._template = t;
		}
		let n = t.cloneNode(true) as HTMLDivElement;
		this.$ = {
			content: n.childNodes[0] as HTMLDivElement,
		};
		this.el = n;
	}
}
export class MergeEditor {
	public static _template : HTMLDivElement;
	public el : HTMLDivElement;
	public $ : R.MergeEditor;
	constructor() {
		let t = MergeEditor._template;
		if (! t ) {
			let d = document.createElement('div');
			d.innerHTML = `<div class="merge-editor"><div class="action-group"><button data-event="click:save" class="btn">Save</button></div><div class="merge-mergely">
	</div></div>`;
			t = d.firstElementChild as HTMLDivElement;
			MergeEditor._template = t;
		}
		let n = t.cloneNode(true) as HTMLDivElement;
		this.$ = {
			mergely: n.childNodes[1] as HTMLDivElement,
		};
		this.el = n;
	}
}
export class PullRequestDiffList_File {
	public static _template : HTMLUListElement;
	public el : HTMLUListElement;
	public $ : R.PullRequestDiffList_File;
	constructor() {
		let t = PullRequestDiffList_File._template;
		if (! t ) {
			let d = document.createElement('div');
			d.innerHTML = `<ul><li data-set="this">
	</li></ul>`;
			t = d.firstElementChild.childNodes[0] as HTMLUListElement;
			PullRequestDiffList_File._template = t;
		}
		let n = t.cloneNode(true) as HTMLUListElement;
		this.$ = {
		};
		this.el = n;
	}
}
export class RepoFileEditLink {
	public static _template : HTMLUListElement;
	public el : HTMLUListElement;
	public $ : R.RepoFileEditLink;
	constructor() {
		let t = RepoFileEditLink._template;
		if (! t ) {
			let d = document.createElement('div');
			d.innerHTML = `<ul><li class="edit-link" data-set="this" data-event="click"><span class="file-dirty-tag"><i class="fa fa-pencil"> </i></span><a href="#"><span> </span></a></li></ul>`;
			t = d.firstElementChild.childNodes[0] as HTMLUListElement;
			RepoFileEditLink._template = t;
		}
		let n = t.cloneNode(true) as HTMLUListElement;
		this.$ = {
			editing: n.childNodes[0].childNodes[0] as HTMLUnknownElement,
			name: n.childNodes[1].childNodes[0] as HTMLSpanElement,
		};
		this.el = n;
	}
}
export class RepoFileEditor_codemirror {
	public static _template : HTMLDivElement;
	public el : HTMLDivElement;
	public $ : R.RepoFileEditor_codemirror;
	constructor() {
		let t = RepoFileEditor_codemirror._template;
		if (! t ) {
			let d = document.createElement('div');
			d.innerHTML = `<div class="repo-file-editor-workspace"><div class="repo-file-editor">
	</div></div>`;
			t = d.firstElementChild as HTMLDivElement;
			RepoFileEditor_codemirror._template = t;
		}
		let n = t.cloneNode(true) as HTMLDivElement;
		this.$ = {
			editor: n.childNodes[0] as HTMLDivElement,
		};
		this.el = n;
	}
}
export class RepoPageEditor_NewFileDialog {
	public static _template : HTMLDivElement;
	public el : HTMLDivElement;
	public $ : R.RepoPageEditor_NewFileDialog;
	constructor() {
		let t = RepoPageEditor_NewFileDialog._template;
		if (! t ) {
			let d = document.createElement('div');
			d.innerHTML = `<div class="reveal" id="new-file-dialog" data-reveal=""><div class="content"><div class="error">
		</div><fieldset><label>
				Enter the full path to your new file.
				<input type="text" placeholder="/book/text/chapter-7.md" data-event="change"/>
			</label></fieldset><button class="btn" data-event="click">Create File</button></div><button class="close-button" aria-label="Close popup" type="button" data-close=""><span aria-hidden="true">×</span></button></div>`;
			t = d.firstElementChild as HTMLDivElement;
			RepoPageEditor_NewFileDialog._template = t;
		}
		let n = t.cloneNode(true) as HTMLDivElement;
		this.$ = {
			error: n.childNodes[0].childNodes[0] as HTMLDivElement,
			filename: n.childNodes[0].childNodes[1].childNodes[0].childNodes[1] as HTMLInputElement,
		};
		this.el = n;
	}
}
export class RepoPageEditor_RenameFileDialog {
	public static _template : HTMLDivElement;
	public el : HTMLDivElement;
	public $ : R.RepoPageEditor_RenameFileDialog;
	constructor() {
		let t = RepoPageEditor_RenameFileDialog._template;
		if (! t ) {
			let d = document.createElement('div');
			d.innerHTML = `<div><div class="error">
	</div><fieldset><div>Renaming <span> </span></div><label>
			Enter the full path to your new file.
			<input type="text" placeholder="/book/text/chapter-7.md" data-event="change"/>
		</label></fieldset><button class="btn" data-event="click">Create File</button></div>`;
			t = d.firstElementChild as HTMLDivElement;
			RepoPageEditor_RenameFileDialog._template = t;
		}
		let n = t.cloneNode(true) as HTMLDivElement;
		this.$ = {
			error: n.childNodes[0] as HTMLDivElement,
			current_name: n.childNodes[1].childNodes[0].childNodes[1] as HTMLSpanElement,
			filename: n.childNodes[1].childNodes[1].childNodes[1] as HTMLInputElement,
		};
		this.el = n;
	}
}

