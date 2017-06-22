// dtemplate generated - do not edit
export namespace EL {
	export type AddNewBookDialog =	HTMLDivElement;
	export type CommitMessageDialog =	HTMLDivElement;
	export type EditorImage =	HTMLDivElement;
	export type FSFileList_File =	HTMLUListElement;
	export type FoundationRevealDialog =	HTMLDivElement;
	export type MergeEditor =	HTMLDivElement;
	export type PullRequestDiffList_File =	HTMLDivElement;
	export type RepoEditorPage_NewFileDialog =	HTMLDivElement;
	export type RepoEditorPage_RenameFileDialog =	HTMLDivElement;
	export type RepoFileEditorCM =	HTMLDivElement;
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
		newBook: HTMLDivElement,
		repo_name: HTMLInputElement,
		collaborate: HTMLDivElement,
		collaborate_repo: HTMLInputElement,
		};
	export interface CommitMessageDialog {
		title: HTMLHeadingElement,
		instructions: HTMLDivElement,
		message: HTMLInputElement,
		notes: HTMLTextAreaElement,
		commit: HTMLButtonElement,
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
export class CommitMessageDialog {
	public static _template : HTMLDivElement;
	public el : HTMLDivElement;
	public $ : R.CommitMessageDialog;
	constructor() {
		let t = CommitMessageDialog._template;
		if (! t ) {
			let d = document.createElement('div');
			d.innerHTML = `<div><h1>Title</h1><div>Instructions</div><fieldset><label for="commitMessage">Enter the commit message
		<input type="text" name="commitMessage" id="commitMessage"/>
		</label><label for="commitNotes">Further notes about the commit
		<textarea name="commitNotes" id="commitNotes" rows="5">
		</textarea>
		</label></fieldset><button class="btn">Commit</button></div>`;
			t = d.firstElementChild as HTMLDivElement;
			CommitMessageDialog._template = t;
		}
		let n = t.cloneNode(true) as HTMLDivElement;
		this.$ = {
			title: n.childNodes[0] as HTMLHeadingElement,
			instructions: n.childNodes[1] as HTMLDivElement,
			message: n.childNodes[2].childNodes[0].childNodes[1] as HTMLInputElement,
			notes: n.childNodes[2].childNodes[1].childNodes[1] as HTMLTextAreaElement,
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
			d.innerHTML = `<div class="merge-instructions"><div class="instructions-button">?</div><div class="instructions-text"><h1>Working with the Merge Editor</h1><p>The file being submitted is displayed in the editor on the <span class="editor-side">THEIRSIDE</span> side.</p><p>The final file you will have is displayed in the editor on the <span class="editor-side">OURSIDE</span> side.</p><p>Use the small buttons to the left of lines to transfer changes between sides.</p><p>When you are satisfied with your changes, press 'Save these changes' to save your changes.</p><p>When you have resolved all the issues between all the files, press 'Resolve this merge' to resolve the conflicted state.</p></div></div>`;
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

