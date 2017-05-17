// dtemplate generated - do not edit
export namespace EL {
	export type AddNewBookDialog =	HTMLDivElement;
	export type EditorImage =	HTMLDivElement;
	export type FSFileList_File =	HTMLUListElement;
	export type FoundationRevealDialog =	HTMLDivElement;
	export type MergeEditor =	HTMLDivElement;
	export type PullRequestDiffList_File =	HTMLDivElement;
	export type RepoEditorPage_NewFileDialog =	HTMLDivElement;
	export type RepoEditorPage_RenameFileDialog =	HTMLDivElement;
	export type RepoFileEditorCM =	HTMLDivElement;
	
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
	export interface EditorImage {
		};
	export interface FSFileList_File {
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
	export interface RepoEditorPage_NewFileDialog {
		filename: HTMLInputElement,
		};
	export interface RepoEditorPage_RenameFileDialog {
		error: HTMLDivElement,
		current_name: HTMLSpanElement,
		filename: HTMLInputElement,
		};
	export interface RepoFileEditorCM {
		textEditor: HTMLDivElement,
		imageEditor: HTMLDivElement,
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
export class EditorImage {
	public static _template : HTMLDivElement;
	public el : HTMLDivElement;
	public $ : R.EditorImage;
	constructor() {
		let t = EditorImage._template;
		if (! t ) {
			let d = document.createElement('div');
			d.innerHTML = `<div> </div>`;
			t = d.firstElementChild as HTMLDivElement;
			EditorImage._template = t;
		}
		let n = t.cloneNode(true) as HTMLDivElement;
		this.$ = {
		};
		this.el = n;
	}
}
export class FSFileList_File {
	public static _template : HTMLUListElement;
	public el : HTMLUListElement;
	public $ : R.FSFileList_File;
	constructor() {
		let t = FSFileList_File._template;
		if (! t ) {
			let d = document.createElement('div');
			d.innerHTML = `<ul><li data-set="this" class="allfiles-file"><div data-event="click:clickFile">NAME
		</div></li></ul>`;
			t = d.firstElementChild.childNodes[0] as HTMLUListElement;
			FSFileList_File._template = t;
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
	public static _template : HTMLDivElement;
	public el : HTMLDivElement;
	public $ : R.PullRequestDiffList_File;
	constructor() {
		let t = PullRequestDiffList_File._template;
		if (! t ) {
			let d = document.createElement('div');
			d.innerHTML = `<div>
</div>`;
			t = d.firstElementChild as HTMLDivElement;
			PullRequestDiffList_File._template = t;
		}
		let n = t.cloneNode(true) as HTMLDivElement;
		this.$ = {
		};
		this.el = n;
	}
}
export class RepoEditorPage_NewFileDialog {
	public static _template : HTMLDivElement;
	public el : HTMLDivElement;
	public $ : R.RepoEditorPage_NewFileDialog;
	constructor() {
		let t = RepoEditorPage_NewFileDialog._template;
		if (! t ) {
			let d = document.createElement('div');
			d.innerHTML = `<div><fieldset><label>
			Enter the full path to your new file.
			<input type="text" placeholder="/book/text/chapter-7.md" data-event="change"/>
		</label></fieldset><button class="btn" data-event="click">Create File</button></div>`;
			t = d.firstElementChild as HTMLDivElement;
			RepoEditorPage_NewFileDialog._template = t;
		}
		let n = t.cloneNode(true) as HTMLDivElement;
		this.$ = {
			filename: n.childNodes[0].childNodes[0].childNodes[1] as HTMLInputElement,
		};
		this.el = n;
	}
}
export class RepoEditorPage_RenameFileDialog {
	public static _template : HTMLDivElement;
	public el : HTMLDivElement;
	public $ : R.RepoEditorPage_RenameFileDialog;
	constructor() {
		let t = RepoEditorPage_RenameFileDialog._template;
		if (! t ) {
			let d = document.createElement('div');
			d.innerHTML = `<div><div class="error">
	</div><fieldset><div>Renaming <span> </span></div><label>
			Enter the full path to your new file.
			<input type="text" placeholder="/book/text/chapter-7.md" data-event="change"/>
		</label></fieldset><button class="btn" data-event="click">Rename</button></div>`;
			t = d.firstElementChild as HTMLDivElement;
			RepoEditorPage_RenameFileDialog._template = t;
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
export class RepoFileEditorCM {
	public static _template : HTMLDivElement;
	public el : HTMLDivElement;
	public $ : R.RepoFileEditorCM;
	constructor() {
		let t = RepoFileEditorCM._template;
		if (! t ) {
			let d = document.createElement('div');
			d.innerHTML = `<div class="repo-file-editor-workspace"><div class="repo-file-editor">
	</div><div class="repo-image-editor">
	</div></div>`;
			t = d.firstElementChild as HTMLDivElement;
			RepoFileEditorCM._template = t;
		}
		let n = t.cloneNode(true) as HTMLDivElement;
		this.$ = {
			textEditor: n.childNodes[0] as HTMLDivElement,
			imageEditor: n.childNodes[1] as HTMLDivElement,
		};
		this.el = n;
	}
}

