// dtemplate generated - do not edit
export namespace EL {
	export type AddNewBookDialog =	HTMLDivElement;
	export type AllFiles_File =	HTMLUListElement;
	export type RepoFileEditLink =	HTMLUListElement;
	export type RepoFileEditor_codemirror =	HTMLDivElement;
	
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
	export interface RepoFileEditLink {
		editing: HTMLUnknownElement,
		name: HTMLSpanElement,
		};
	export interface RepoFileEditor_codemirror {
		editor: HTMLDivElement,
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
			d.innerHTML = `<div>
	<div>
		<h1>Add a New Book</h1>
		<fieldset>
			<label>
				<input type="radio" value="new"/>
				Start a new book.
			</label>
			<label>
				<input type="radio" value="collaborate"/>
				Collaborate on an existing book.
			</label>
		</fieldset>
		<button data-event="click:choseType" class="btn">Next</button>
	</div>
	<div>
		<h1>New Book</h1>
		<form method="post" action="/github/create/new">
		<input type="hidden" name="action" value="new"/>
		<label>Enter the name for your new book.
		<input type="text" name="repo_new" placeholder="e.g. MobyDick"/>
		</label>
		<input type="submit" class="btn" value="New Book"/>
		</form>
	</div>
	<div>
		<h1>Collaborate</h1>
		<form method="post" action="/github/create/fork">
		<input type="hidden" name="action" value="fork"/>
		<label>Enter the owner and repo for the book you will collaborate on.
		<input type="text" name="collaborate_repo" placeholder="e.g. electricbooks/core"/>
		</label>
		<input type="submit" class="btn" value="Collaborate"/>
		</form>
	</div>
</div>`;
			t = d.firstElementChild as HTMLDivElement;
			AddNewBookDialog._template = t;
		}
		let n = t.cloneNode(true) as HTMLDivElement;
		this.$ = {
			chooseType: n.childNodes[1] as HTMLDivElement,
			newBookRadio: n.childNodes[1].childNodes[3].childNodes[1].childNodes[1] as HTMLInputElement,
			collaborateRadio: n.childNodes[1].childNodes[3].childNodes[3].childNodes[1] as HTMLInputElement,
			newBook: n.childNodes[3] as HTMLDivElement,
			repo_name: n.childNodes[3].childNodes[3].childNodes[3].childNodes[1] as HTMLInputElement,
			collaborate: n.childNodes[5] as HTMLDivElement,
			collaborate_repo: n.childNodes[5].childNodes[3].childNodes[3].childNodes[1] as HTMLInputElement,
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
			d.innerHTML = `<ul>
	<li data-set="this" class="allfiles-file">
		<div data-event="click:clickName">NAME
		</div>
	</li>
</ul>`;
			t = d.firstElementChild.childNodes[1] as HTMLUListElement;
			AllFiles_File._template = t;
		}
		let n = t.cloneNode(true) as HTMLUListElement;
		this.$ = {
			name: n.childNodes[1] as HTMLDivElement,
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
			d.innerHTML = `<ul>
	<li class="edit-link" data-set="this" data-event="click">
		<span class="file-dirty-tag"><i class="fa fa-pencil"> </i></span>
		<a href="#"><span> </span></a>
	</li>
</ul>`;
			t = d.firstElementChild.childNodes[1] as HTMLUListElement;
			RepoFileEditLink._template = t;
		}
		let n = t.cloneNode(true) as HTMLUListElement;
		this.$ = {
			editing: n.childNodes[1].childNodes[0] as HTMLUnknownElement,
			name: n.childNodes[3].childNodes[0] as HTMLSpanElement,
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
			d.innerHTML = `<div class="repo-file-editor-workspace">
	<div class="repo-file-editor">
	</div>
</div>`;
			t = d.firstElementChild as HTMLDivElement;
			RepoFileEditor_codemirror._template = t;
		}
		let n = t.cloneNode(true) as HTMLDivElement;
		this.$ = {
			editor: n.childNodes[1] as HTMLDivElement,
		};
		this.el = n;
	}
}

