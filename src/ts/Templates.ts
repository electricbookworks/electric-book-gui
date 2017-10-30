// dtemplate generated - do not edit
export namespace EL {
	export type AddNewBookDialog =	HTMLDivElement;
	export type BoundFilename =	HTMLDivElement;
	export type CommitMessageDialog =	HTMLDivElement;
	export type EditorImage =	HTMLDivElement;
	export type FSFileList_File =	HTMLUListElement;
	export type FileListDialog =	HTMLDivElement;
	export type FileListDialog_Item =	HTMLUListElement;
	export type FoundationRevealDialog =	HTMLDivElement;
	export type LoginTokenDisplay =	HTMLUListElement;
	export type LoginTokenList =	HTMLDivElement;
	export type MergeEditor =	HTMLDivElement;
	export type PrintListenerTerminal =	HTMLDivElement;
	export type PullRequestDiffList_File =	HTMLDivElement;
	export type RepoEditorPage_NewFileDialog =	HTMLDivElement;
	export type RepoEditorPage_RenameFileDialog =	HTMLDivElement;
	export type RepoFileEditorCM =	HTMLDivElement;
	export type RepoFileViewerFile =	HTMLDivElement;
	export type RepoFileViewerPage =	HTMLDivElement;
	export type RepoMergeDialog =	HTMLDivElement;
	export type conflict_ClosePRDialog =	HTMLDivElement;
	export type conflict_FileDisplay =	HTMLLIElement;
	export type conflict_FileListDisplay =	HTMLUListElement;
	export type conflict_MergeInstructions =	HTMLDivElement;
	
}
export namespace R {
	export interface AddNewBookDialog {
		chooseType: HTMLDivElement,
		newBookRadio: HTMLInputElement,
		collaborateRadio: HTMLInputElement,
		adaptationRadio: HTMLInputElement,
		newBook: HTMLDivElement,
		repo_name: HTMLInputElement,
		org_name: HTMLInputElement,
		adaptation: HTMLDivElement,
		adaptation_repo_name: HTMLInputElement,
		adaptation_org_name: HTMLInputElement,
		template: HTMLInputElement,
		collaborate: HTMLDivElement,
		collaborate_repo: HTMLInputElement,
		};
	export interface BoundFilename {
		filename: HTMLSpanElement,
		a: HTMLAnchorElement,
		};
	export interface CommitMessageDialog {
		title: HTMLHeadingElement,
		instructions: HTMLDivElement,
		message: HTMLInputElement,
		commit: HTMLButtonElement,
		};
	export interface EditorImage {
		};
	export interface FSFileList_File {
		name: HTMLDivElement,
		};
	export interface FileListDialog {
		list: HTMLUListElement,
		};
	export interface FileListDialog_Item {
		input: HTMLInputElement,
		title: HTMLSpanElement,
		};
	export interface FoundationRevealDialog {
		content: HTMLDivElement,
		};
	export interface LoginTokenDisplay {
		link: HTMLAnchorElement,
		delete: HTMLAnchorElement,
		};
	export interface LoginTokenList {
		name: HTMLInputElement,
		token: HTMLInputElement,
		add: HTMLButtonElement,
		list: HTMLUListElement,
		};
	export interface MergeEditor {
		mergely: HTMLDivElement,
		};
	export interface PrintListenerTerminal {
		header: HTMLDivElement,
		title: HTMLDivElement,
		close: HTMLDivElement,
		terminal: HTMLDivElement,
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
	export interface RepoFileViewerFile {
		img: HTMLImageElement,
		filename: HTMLDivElement,
		};
	export interface RepoFileViewerPage {
		search: HTMLInputElement,
		data: HTMLDivElement,
		};
	export interface RepoMergeDialog {
		title: HTMLHeadingElement,
		resolveOur: HTMLInputElement,
		resolveGit: HTMLInputElement,
		resolveTheir: HTMLInputElement,
		conflicted: HTMLInputElement,
		mergeButton: HTMLButtonElement,
		};
	export interface conflict_ClosePRDialog {
		title: HTMLHeadingElement,
		instructions: HTMLDivElement,
		closePR_no: HTMLInputElement,
		closePR_yes: HTMLInputElement,
		closeMessage: HTMLInputElement,
		};
	export interface conflict_FileDisplay {
		path: HTMLSpanElement,
		status: HTMLSpanElement,
		};
	export interface conflict_FileListDisplay {
		};
	export interface conflict_MergeInstructions {
		show: HTMLDivElement,
		text: HTMLDivElement,
		theirSide: HTMLSpanElement,
		ourSide: HTMLSpanElement,
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
			d.innerHTML = `<div><div><h1>Add a project</h1><fieldset><label><input type="radio" value="new" name="new-project-type"/>
				Start a new project.
			</label><label><input type="radio" value="collaborate" name="new-project-type"/>
				Contribute to an existing project.
			</label><label><input type="radio" value="adaptation" name="new-project-type"/>
				Create an adaptation of an existing project.
			</label></fieldset><button data-event="click:choseType" class="btn">Next</button></div><div><h1>New project</h1><form method="post" action="/github/create/new"><input type="hidden" name="action" value="new"/><label>Enter the name for your new project. Use only letters and dashes; no spaces.
		<input type="text" name="repo_new" placeholder="e.g. MobyDick"/>
		</label><label>Enter the organization this project should belong to, or leave this field
		blank if you will yourself be the owner of this project.
		<input type="text" name="org_name" placeholder="e.g. electricbookworks"/>
		</label><input type="submit" class="btn" value="New project"/></form></div><div><h1>Adaptation</h1><form method="post" action="/github/create/new"><input type="hidden" name="action" value="new"/><label>Enter the name for your new project. Use only letters and dashes; no spaces.
		<input type="text" name="repo_new" placeholder="e.g. MobyDick"/>
		</label><label>Enter the organization this project should belong to, or leave this field
		blank if you will yourself be the owner of this project.
		<input type="text" name="org_name" placeholder="e.g. electricbookworks"/>
		</label><label>Enter the series that you will be adapting.
		<input type="text" name="template" placeholder="e.g. electricbookworks/electric-book"/>
		</label><input type="submit" class="btn" value="New adaptation"/></form></div><div><h1>Contributing</h1><form method="post" action="/github/create/fork"><input type="hidden" name="action" value="fork"/><label>Enter the GitHub owner and repo for the project you will contribute to.
		<input type="text" name="collaborate_repo" placeholder="e.g. electricbooks/core"/>
		</label><input type="submit" class="btn" value="Copy project"/></form></div></div>`;
			t = d.firstElementChild as HTMLDivElement;
			AddNewBookDialog._template = t;
		}
		let n = t.cloneNode(true) as HTMLDivElement;
		this.$ = {
			chooseType: n.childNodes[0] as HTMLDivElement,
			newBookRadio: n.childNodes[0].childNodes[1].childNodes[0].childNodes[0] as HTMLInputElement,
			collaborateRadio: n.childNodes[0].childNodes[1].childNodes[1].childNodes[0] as HTMLInputElement,
			adaptationRadio: n.childNodes[0].childNodes[1].childNodes[2].childNodes[0] as HTMLInputElement,
			newBook: n.childNodes[1] as HTMLDivElement,
			repo_name: n.childNodes[1].childNodes[1].childNodes[1].childNodes[1] as HTMLInputElement,
			org_name: n.childNodes[1].childNodes[1].childNodes[2].childNodes[1] as HTMLInputElement,
			adaptation: n.childNodes[2] as HTMLDivElement,
			adaptation_repo_name: n.childNodes[2].childNodes[1].childNodes[1].childNodes[1] as HTMLInputElement,
			adaptation_org_name: n.childNodes[2].childNodes[1].childNodes[2].childNodes[1] as HTMLInputElement,
			template: n.childNodes[2].childNodes[1].childNodes[3].childNodes[1] as HTMLInputElement,
			collaborate: n.childNodes[3] as HTMLDivElement,
			collaborate_repo: n.childNodes[3].childNodes[1].childNodes[1].childNodes[1] as HTMLInputElement,
		};
		this.el = n;
	}
}
export class BoundFilename {
	public static _template : HTMLDivElement;
	public el : HTMLDivElement;
	public $ : R.BoundFilename;
	constructor() {
		let t = BoundFilename._template;
		if (! t ) {
			let d = document.createElement('div');
			d.innerHTML = `<div class="bound-filename"><span>Select a file to edit</span><a href="#" target="_github"><img src="/img/github-dark.svg"/></a></div>`;
			t = d.firstElementChild as HTMLDivElement;
			BoundFilename._template = t;
		}
		let n = t.cloneNode(true) as HTMLDivElement;
		this.$ = {
			filename: n.childNodes[0] as HTMLSpanElement,
			a: n.childNodes[1] as HTMLAnchorElement,
		};
		this.el = n;
	}
}
export class CommitMessageDialog {
	public static _template : HTMLDivElement;
	public el : HTMLDivElement;
	public $ : R.CommitMessageDialog;
	constructor() {
		let t = CommitMessageDialog._template;
		if (! t ) {
			let d = document.createElement('div');
			d.innerHTML = `<div><h1>Title</h1><div>Instructions</div><fieldset><label for="commitMessage">Describe your changes
		<input type="text" name="commitMessage" id="commitMessage"/>
		</label></fieldset><button class="btn">Commit</button></div>`;
			t = d.firstElementChild as HTMLDivElement;
			CommitMessageDialog._template = t;
		}
		let n = t.cloneNode(true) as HTMLDivElement;
		this.$ = {
			title: n.childNodes[0] as HTMLHeadingElement,
			instructions: n.childNodes[1] as HTMLDivElement,
			message: n.childNodes[2].childNodes[0].childNodes[1] as HTMLInputElement,
			commit: n.childNodes[3] as HTMLButtonElement,
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
export class FileListDialog {
	public static _template : HTMLDivElement;
	public el : HTMLDivElement;
	public $ : R.FileListDialog;
	constructor() {
		let t = FileListDialog._template;
		if (! t ) {
			let d = document.createElement('div');
			d.innerHTML = `<div><h1>Print Version</h1><p>Choose the project version you want to print:</p><ul class="file-list-dialog-list">
	</ul></div>`;
			t = d.firstElementChild as HTMLDivElement;
			FileListDialog._template = t;
		}
		let n = t.cloneNode(true) as HTMLDivElement;
		this.$ = {
			list: n.childNodes[2] as HTMLUListElement,
		};
		this.el = n;
	}
}
export class FileListDialog_Item {
	public static _template : HTMLUListElement;
	public el : HTMLUListElement;
	public $ : R.FileListDialog_Item;
	constructor() {
		let t = FileListDialog_Item._template;
		if (! t ) {
			let d = document.createElement('div');
			d.innerHTML = `<ul><li data-set="this"><input type="radio" name="file-list"/><span/></li></ul>`;
			t = d.firstElementChild.childNodes[0] as HTMLUListElement;
			FileListDialog_Item._template = t;
		}
		let n = t.cloneNode(true) as HTMLUListElement;
		this.$ = {
			input: n.childNodes[0] as HTMLInputElement,
			title: n.childNodes[1] as HTMLSpanElement,
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
export class LoginTokenDisplay {
	public static _template : HTMLUListElement;
	public el : HTMLUListElement;
	public $ : R.LoginTokenDisplay;
	constructor() {
		let t = LoginTokenDisplay._template;
		if (! t ) {
			let d = document.createElement('div');
			d.innerHTML = `<ul><li data-set="this" class="token-display"><a href="">LINK</a><a href="">X</a></li></ul>`;
			t = d.firstElementChild.childNodes[0] as HTMLUListElement;
			LoginTokenDisplay._template = t;
		}
		let n = t.cloneNode(true) as HTMLUListElement;
		this.$ = {
			link: n.childNodes[0] as HTMLAnchorElement,
			delete: n.childNodes[1] as HTMLAnchorElement,
		};
		this.el = n;
	}
}
export class LoginTokenList {
	public static _template : HTMLDivElement;
	public el : HTMLDivElement;
	public $ : R.LoginTokenList;
	constructor() {
		let t = LoginTokenList._template;
		if (! t ) {
			let d = document.createElement('div');
			d.innerHTML = `<div class="login-token-list"><div class="token-input"><input type="text" placeholder="name"/><input type="text" placeholder="token"/><button class="btn">Add</button></div><ul class="token-list">
	</ul></div>`;
			t = d.firstElementChild as HTMLDivElement;
			LoginTokenList._template = t;
		}
		let n = t.cloneNode(true) as HTMLDivElement;
		this.$ = {
			name: n.childNodes[0].childNodes[0] as HTMLInputElement,
			token: n.childNodes[0].childNodes[1] as HTMLInputElement,
			add: n.childNodes[0].childNodes[2] as HTMLButtonElement,
			list: n.childNodes[1] as HTMLUListElement,
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
export class PrintListenerTerminal {
	public static _template : HTMLDivElement;
	public el : HTMLDivElement;
	public $ : R.PrintListenerTerminal;
	constructor() {
		let t = PrintListenerTerminal._template;
		if (! t ) {
			let d = document.createElement('div');
			d.innerHTML = `<div id="print-listener"><div class="header"><div class="title">Printing in progress...
		</div><div class="close">X</div></div><div class="terminal">
	</div></div>`;
			t = d.firstElementChild as HTMLDivElement;
			PrintListenerTerminal._template = t;
		}
		let n = t.cloneNode(true) as HTMLDivElement;
		this.$ = {
			header: n.childNodes[0] as HTMLDivElement,
			title: n.childNodes[0].childNodes[0] as HTMLDivElement,
			close: n.childNodes[0].childNodes[1] as HTMLDivElement,
			terminal: n.childNodes[1] as HTMLDivElement,
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
			<input type="text" placeholder="book/text/chapter-7.md" data-event="change"/>
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
export class RepoFileViewerFile {
	public static _template : HTMLDivElement;
	public el : HTMLDivElement;
	public $ : R.RepoFileViewerFile;
	constructor() {
		let t = RepoFileViewerFile._template;
		if (! t ) {
			let d = document.createElement('div');
			d.innerHTML = `<div class="repo-file-viewer-file"><div class="image"><img/></div><div class="filename"/></div>`;
			t = d.firstElementChild as HTMLDivElement;
			RepoFileViewerFile._template = t;
		}
		let n = t.cloneNode(true) as HTMLDivElement;
		this.$ = {
			img: n.childNodes[0].childNodes[0] as HTMLImageElement,
			filename: n.childNodes[1] as HTMLDivElement,
		};
		this.el = n;
	}
}
export class RepoFileViewerPage {
	public static _template : HTMLDivElement;
	public el : HTMLDivElement;
	public $ : R.RepoFileViewerPage;
	constructor() {
		let t = RepoFileViewerPage._template;
		if (! t ) {
			let d = document.createElement('div');
			d.innerHTML = `<div class="repo-file-viewer"><div class="searchbar"><input type="text" placeholder="Enter search text to find images."/></div><div class="data">
	</div></div>`;
			t = d.firstElementChild as HTMLDivElement;
			RepoFileViewerPage._template = t;
		}
		let n = t.cloneNode(true) as HTMLDivElement;
		this.$ = {
			search: n.childNodes[0].childNodes[0] as HTMLInputElement,
			data: n.childNodes[1] as HTMLDivElement,
		};
		this.el = n;
	}
}
export class RepoMergeDialog {
	public static _template : HTMLDivElement;
	public el : HTMLDivElement;
	public $ : R.RepoMergeDialog;
	constructor() {
		let t = RepoMergeDialog._template;
		if (! t ) {
			let d = document.createElement('div');
			d.innerHTML = `<div><h1>Updating a Repo</h1><p>How do you want to try this merge?</p><fieldset><label for="resolveOur"><input type="radio" name="resolve" value="our" id="resolveOur"/>
			I will do the merge.
		</label><label for="resolveGit"><input type="radio" name="resolve" value="git" id="resolveGit"/>
			Git can try to merge.
		</label><label for="resolveTheir"><input type="radio" name="resolve" value="their" id="resolveTheir"/>
			Choose their files by preference.
		</label></fieldset><label for="conflicted"><input type="checkbox" name="conflicted" value="only" id="conflicted"/>
			Only apply above resolution to conflicted files.
	</label><button class="btn" data-event="click:">Do the Merge</button></div>`;
			t = d.firstElementChild as HTMLDivElement;
			RepoMergeDialog._template = t;
		}
		let n = t.cloneNode(true) as HTMLDivElement;
		this.$ = {
			title: n.childNodes[0] as HTMLHeadingElement,
			resolveOur: n.childNodes[2].childNodes[0].childNodes[0] as HTMLInputElement,
			resolveGit: n.childNodes[2].childNodes[1].childNodes[0] as HTMLInputElement,
			resolveTheir: n.childNodes[2].childNodes[2].childNodes[0] as HTMLInputElement,
			conflicted: n.childNodes[3].childNodes[0] as HTMLInputElement,
			mergeButton: n.childNodes[4] as HTMLButtonElement,
		};
		this.el = n;
	}
}
export class conflict_ClosePRDialog {
	public static _template : HTMLDivElement;
	public el : HTMLDivElement;
	public $ : R.conflict_ClosePRDialog;
	constructor() {
		let t = conflict_ClosePRDialog._template;
		if (! t ) {
			let d = document.createElement('div');
			d.innerHTML = `<div><h1>Title</h1><div>Instructions</div><fieldset><label for="closePR-no"><input type="radio" name="closePR" id="closePR-no" value="no" data-event="change"/>No
		</label><label for="closePR-yes"><input type="radio" name="closePR" id="closePR-yes" value="yes" data-event="change"/>Yes
		</label><label for="closeMessage">Close message
		<input type="text" name="closeMessage" id="closeMessage"/>
		</label></fieldset><button class="btn" data-event="click:done">Done</button></div>`;
			t = d.firstElementChild as HTMLDivElement;
			conflict_ClosePRDialog._template = t;
		}
		let n = t.cloneNode(true) as HTMLDivElement;
		this.$ = {
			title: n.childNodes[0] as HTMLHeadingElement,
			instructions: n.childNodes[1] as HTMLDivElement,
			closePR_no: n.childNodes[2].childNodes[0].childNodes[0] as HTMLInputElement,
			closePR_yes: n.childNodes[2].childNodes[1].childNodes[0] as HTMLInputElement,
			closeMessage: n.childNodes[2].childNodes[2].childNodes[1] as HTMLInputElement,
		};
		this.el = n;
	}
}
export class conflict_FileDisplay {
	public static _template : HTMLLIElement;
	public el : HTMLLIElement;
	public $ : R.conflict_FileDisplay;
	constructor() {
		let t = conflict_FileDisplay._template;
		if (! t ) {
			let d = document.createElement('div');
			d.innerHTML = `<li class="file-display"><span class="path"> </span><span class="status"> </span></li>`;
			t = d.firstElementChild as HTMLLIElement;
			conflict_FileDisplay._template = t;
		}
		let n = t.cloneNode(true) as HTMLLIElement;
		this.$ = {
			path: n.childNodes[0] as HTMLSpanElement,
			status: n.childNodes[1] as HTMLSpanElement,
		};
		this.el = n;
	}
}
export class conflict_FileListDisplay {
	public static _template : HTMLUListElement;
	public el : HTMLUListElement;
	public $ : R.conflict_FileListDisplay;
	constructor() {
		let t = conflict_FileListDisplay._template;
		if (! t ) {
			let d = document.createElement('div');
			d.innerHTML = `<ul class="conflict-file-list-display">
</ul>`;
			t = d.firstElementChild as HTMLUListElement;
			conflict_FileListDisplay._template = t;
		}
		let n = t.cloneNode(true) as HTMLUListElement;
		this.$ = {
		};
		this.el = n;
	}
}
export class conflict_MergeInstructions {
	public static _template : HTMLDivElement;
	public el : HTMLDivElement;
	public $ : R.conflict_MergeInstructions;
	constructor() {
		let t = conflict_MergeInstructions._template;
		if (! t ) {
			let d = document.createElement('div');
			d.innerHTML = `<div class="merge-instructions"><div class="instructions-button">?</div><div class="instructions-text"><h1>Working with the merge editor</h1><p>The file being submitted is displayed in the editor on the <span class="editor-side">THEIRSIDE</span> side.</p><p>The final file you will save is displayed in the editor on the <span class="editor-side">OURSIDE</span> side.</p><p>Use the small buttons to the left of lines to transfer changes between sides.</p><p>When you are satisfied with your changes, press 'Save these changes' to save your changes.</p><p>When you have resolved all the issues between all the files, press 'Resolve this merge' to resolve the conflicted state.</p></div></div>`;
			t = d.firstElementChild as HTMLDivElement;
			conflict_MergeInstructions._template = t;
		}
		let n = t.cloneNode(true) as HTMLDivElement;
		this.$ = {
			show: n.childNodes[0] as HTMLDivElement,
			text: n.childNodes[1] as HTMLDivElement,
			theirSide: n.childNodes[1].childNodes[1].childNodes[1] as HTMLSpanElement,
			ourSide: n.childNodes[1].childNodes[2].childNodes[1] as HTMLSpanElement,
		};
		this.el = n;
	}
}

