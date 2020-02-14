// dtemplate generated - do not edit
export namespace EL {
	export type AddNewBookDialog =	HTMLUnknownElement;
	export type BoundFilename =	HTMLUnknownElement;
	export type CommitMessageDialog =	HTMLUnknownElement;
	export type CommitSummaryListView =	HTMLUnknownElement;
	export type CommitSummaryView =	HTMLUnknownElement;
	export type EditorImage =	HTMLUnknownElement;
	export type FSFileList_File =	HTMLUnknownElement;
	export type FileListDialog =	HTMLUnknownElement;
	export type FileListDialog_Item =	HTMLUnknownElement;
	export type FileTree_Dir =	HTMLUnknownElement;
	export type FoundationRevealDialog =	HTMLUnknownElement;
	export type LoginTokenDisplay =	HTMLUnknownElement;
	export type LoginTokenList =	HTMLUnknownElement;
	export type MergeEditor =	HTMLUnknownElement;
	export type PrintListenerTerminal =	HTMLUnknownElement;
	export type PullRequestDiffList_File =	HTMLUnknownElement;
	export type RepoEditorPage_NewFileDialog =	HTMLUnknownElement;
	export type RepoEditorPage_RenameFileDialog =	HTMLUnknownElement;
	export type RepoFileEditorCM =	HTMLUnknownElement;
	export type RepoFileViewerFile =	HTMLUnknownElement;
	export type RepoFileViewerPage =	HTMLUnknownElement;
	export type RepoMergeDialog =	HTMLUnknownElement;
	export type Tree_NodeView =	HTMLUnknownElement;
	export type conflict_ClosePRDialog =	HTMLUnknownElement;
	export type conflict_FileDisplay =	HTMLUnknownElement;
	export type conflict_FileListDisplay =	HTMLUnknownElement;
	export type conflict_MergeImageEditor =	HTMLUnknownElement;
	export type conflict_MergeInstructions =	HTMLUnknownElement;
	
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
		private_new: HTMLInputElement,
		adaptation: HTMLDivElement,
		adaptation_repo_name: HTMLInputElement,
		adaptation_org_name: HTMLInputElement,
		template: HTMLInputElement,
		private_adapt: HTMLInputElement,
		collaborate: HTMLDivElement,
		collaborate_repo: HTMLInputElement,
		private_collaborate: HTMLInputElement,
		};
	export interface BoundFilename {
		filename: HTMLSpanElement,
		};
	export interface CommitMessageDialog {
		title: HTMLHeadingElement,
		instructions: HTMLDivElement,
		message: HTMLInputElement,
		commit: HTMLButtonElement,
		};
	export interface CommitSummaryListView {
		summaries: HTMLDivElement,
		};
	export interface CommitSummaryView {
		when: HTMLDivElement,
		message: HTMLDivElement,
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
	export interface FileTree_Dir {
		name: HTMLDivElement,
		elements: HTMLDivElement,
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
	export interface Tree_NodeView {
		close: HTMLSpanElement,
		name: HTMLSpanElement,
		children: HTMLDivElement,
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
	export interface conflict_MergeImageEditor {
		ours: HTMLDivElement,
		theirs: HTMLDivElement,
		};
	export interface conflict_MergeInstructions {
		show: HTMLDivElement,
		text: HTMLDivElement,
		theirSide: HTMLSpanElement,
		ourSide: HTMLSpanElement,
		};
	
}	// end namespace R
export class AddNewBookDialog {
	protected static _template : HTMLUnknownElement;
	public el : HTMLUnknownElement;
	public $ : R.AddNewBookDialog;
	constructor() {
		let t = AddNewBookDialog._template;
		if (! t ) {
			let d = document.createElement('div');
			d.innerHTML = `<div>
	<div>
		<h1>Add a project</h1>
		<fieldset>
			<label>
				<input type="radio" value="new" name="new-project-type"/>
				Start a new project.
			</label>
			<label>
				<input value="collaborate" name="new-project-type" type="radio"/>
				Contribute to an existing project.
			</label>
			<label>
				<input type="radio" value="adaptation" name="new-project-type"/>
				Create an adaptation of an existing project.
			</label>
		</fieldset>
		<button data-event="click:choseType" class="btn">Next</button>
	</div>
	<div>
		<h1>New project</h1>
		<form method="post" action="/github/create/new">
		<input type="hidden" name="action" value="new"/>
		<label>Enter the name for your new project. Use only letters and dashes; no spaces.
		<input type="text" name="repo_new" placeholder="e.g. MobyDick"/>
		</label>
		<label>Enter the organization this project should belong to, or leave this field
		blank if you will yourself be the owner of this project.
		<input type="text" name="org_name" placeholder="e.g. electricbookworks"/>
		</label>
		<label>
			<input type="checkbox" name="private" value="private"/>
			Make this project private (must be supported by user's Github plan).
		</label>
		<input type="submit" class="btn" value="New project"/>
		</form>
	</div>
	<div>
		<h1>Adaptation</h1>
		<form method="post" action="/github/create/new">
		<input value="new" type="hidden" name="action"/>
		<label>Enter the name for your new project. Use only letters and dashes; no spaces.
		<input type="text" name="repo_new" placeholder="e.g. MobyDick"/>
		</label>
		<label>Enter the organization this project should belong to, or leave this field
		blank if you will yourself be the owner of this project.
		<input type="text" name="org_name" placeholder="e.g. electricbookworks"/>
		</label>
		<label>Enter the series that you will be adapting.
		<input type="text" name="template" placeholder="e.g. electricbookworks/electric-book"/>
		</label>
		<label>
			<input type="checkbox" name="private" value="private"/>
			Make this project private (must be supported by user's Github plan).
		</label>
		<input type="submit" class="btn" value="New adaptation"/>
		</form>
	</div>
	<div>
		<h1>Contributing</h1>
		<form method="post" action="/github/create/fork">
		<input name="action" value="fork" type="hidden"/>
		<label>Enter the GitHub owner and repo for the project you will contribute to.
		<input type="text" name="collaborate_repo" placeholder="e.g. electricbooks/core"/>
		</label>
		<label style="display:none;">
			<input name="private" value="private" type="checkbox"/>
			Make this project private (must be supported by user's Github plan).
		</label>
		<input class="btn" value="Copy project" type="submit"/>
		</form>
	</div>
</div>
`;
			t = d.firstElementChild as HTMLUnknownElement;
			AddNewBookDialog._template = t;
		}
		let n = t.cloneNode(true) as HTMLUnknownElement;
		
		this.$ = {
			chooseType: n.childNodes[1] as HTMLDivElement,
			newBookRadio: n.childNodes[1].childNodes[3].childNodes[1].childNodes[1] as HTMLInputElement,
			collaborateRadio: n.childNodes[1].childNodes[3].childNodes[3].childNodes[1] as HTMLInputElement,
			adaptationRadio: n.childNodes[1].childNodes[3].childNodes[5].childNodes[1] as HTMLInputElement,
			newBook: n.childNodes[3] as HTMLDivElement,
			repo_name: n.childNodes[3].childNodes[3].childNodes[3].childNodes[1] as HTMLInputElement,
			org_name: n.childNodes[3].childNodes[3].childNodes[5].childNodes[1] as HTMLInputElement,
			private_new: n.childNodes[3].childNodes[3].childNodes[7].childNodes[1] as HTMLInputElement,
			adaptation: n.childNodes[5] as HTMLDivElement,
			adaptation_repo_name: n.childNodes[5].childNodes[3].childNodes[3].childNodes[1] as HTMLInputElement,
			adaptation_org_name: n.childNodes[5].childNodes[3].childNodes[5].childNodes[1] as HTMLInputElement,
			template: n.childNodes[5].childNodes[3].childNodes[7].childNodes[1] as HTMLInputElement,
			private_adapt: n.childNodes[5].childNodes[3].childNodes[9].childNodes[1] as HTMLInputElement,
			collaborate: n.childNodes[7] as HTMLDivElement,
			collaborate_repo: n.childNodes[7].childNodes[3].childNodes[3].childNodes[1] as HTMLInputElement,
			private_collaborate: n.childNodes[7].childNodes[3].childNodes[5].childNodes[1] as HTMLInputElement,
		};
		/*
		
		
		if (!this.$.chooseType) {
			console.error("Failed to resolve item chooseType on path .childNodes[1] of ", n);
			debugger;
		} else {
			console.log("chooseType resolved to ", this.$.chooseType);
		}
		
		
		if (!this.$.newBookRadio) {
			console.error("Failed to resolve item newBookRadio on path .childNodes[1].childNodes[3].childNodes[1].childNodes[1] of ", n);
			debugger;
		} else {
			console.log("newBookRadio resolved to ", this.$.newBookRadio);
		}
		
		
		if (!this.$.collaborateRadio) {
			console.error("Failed to resolve item collaborateRadio on path .childNodes[1].childNodes[3].childNodes[3].childNodes[1] of ", n);
			debugger;
		} else {
			console.log("collaborateRadio resolved to ", this.$.collaborateRadio);
		}
		
		
		if (!this.$.adaptationRadio) {
			console.error("Failed to resolve item adaptationRadio on path .childNodes[1].childNodes[3].childNodes[5].childNodes[1] of ", n);
			debugger;
		} else {
			console.log("adaptationRadio resolved to ", this.$.adaptationRadio);
		}
		
		
		if (!this.$.newBook) {
			console.error("Failed to resolve item newBook on path .childNodes[3] of ", n);
			debugger;
		} else {
			console.log("newBook resolved to ", this.$.newBook);
		}
		
		
		if (!this.$.repo_name) {
			console.error("Failed to resolve item repo_name on path .childNodes[3].childNodes[3].childNodes[3].childNodes[1] of ", n);
			debugger;
		} else {
			console.log("repo_name resolved to ", this.$.repo_name);
		}
		
		
		if (!this.$.org_name) {
			console.error("Failed to resolve item org_name on path .childNodes[3].childNodes[3].childNodes[5].childNodes[1] of ", n);
			debugger;
		} else {
			console.log("org_name resolved to ", this.$.org_name);
		}
		
		
		if (!this.$.private_new) {
			console.error("Failed to resolve item private_new on path .childNodes[3].childNodes[3].childNodes[7].childNodes[1] of ", n);
			debugger;
		} else {
			console.log("private_new resolved to ", this.$.private_new);
		}
		
		
		if (!this.$.adaptation) {
			console.error("Failed to resolve item adaptation on path .childNodes[5] of ", n);
			debugger;
		} else {
			console.log("adaptation resolved to ", this.$.adaptation);
		}
		
		
		if (!this.$.adaptation_repo_name) {
			console.error("Failed to resolve item adaptation_repo_name on path .childNodes[5].childNodes[3].childNodes[3].childNodes[1] of ", n);
			debugger;
		} else {
			console.log("adaptation_repo_name resolved to ", this.$.adaptation_repo_name);
		}
		
		
		if (!this.$.adaptation_org_name) {
			console.error("Failed to resolve item adaptation_org_name on path .childNodes[5].childNodes[3].childNodes[5].childNodes[1] of ", n);
			debugger;
		} else {
			console.log("adaptation_org_name resolved to ", this.$.adaptation_org_name);
		}
		
		
		if (!this.$.template) {
			console.error("Failed to resolve item template on path .childNodes[5].childNodes[3].childNodes[7].childNodes[1] of ", n);
			debugger;
		} else {
			console.log("template resolved to ", this.$.template);
		}
		
		
		if (!this.$.private_adapt) {
			console.error("Failed to resolve item private_adapt on path .childNodes[5].childNodes[3].childNodes[9].childNodes[1] of ", n);
			debugger;
		} else {
			console.log("private_adapt resolved to ", this.$.private_adapt);
		}
		
		
		if (!this.$.collaborate) {
			console.error("Failed to resolve item collaborate on path .childNodes[7] of ", n);
			debugger;
		} else {
			console.log("collaborate resolved to ", this.$.collaborate);
		}
		
		
		if (!this.$.collaborate_repo) {
			console.error("Failed to resolve item collaborate_repo on path .childNodes[7].childNodes[3].childNodes[3].childNodes[1] of ", n);
			debugger;
		} else {
			console.log("collaborate_repo resolved to ", this.$.collaborate_repo);
		}
		
		
		if (!this.$.private_collaborate) {
			console.error("Failed to resolve item private_collaborate on path .childNodes[7].childNodes[3].childNodes[5].childNodes[1] of ", n);
			debugger;
		} else {
			console.log("private_collaborate resolved to ", this.$.private_collaborate);
		}
		
		*/
		this.el = n;
	}
}
export class BoundFilename {
	protected static _template : HTMLUnknownElement;
	public el : HTMLUnknownElement;
	public $ : R.BoundFilename;
	constructor() {
		let t = BoundFilename._template;
		if (! t ) {
			let d = document.createElement('div');
			d.innerHTML = `<div class="bound-filename">
	<span class="bound-filename-text">Select a file to edit</span>
	<!-- <a href="#" data-set="a" target="_github"><img src="/img/github-dark.svg" /></a> -->
</div>
`;
			t = d.firstElementChild as HTMLUnknownElement;
			BoundFilename._template = t;
		}
		let n = t.cloneNode(true) as HTMLUnknownElement;
		
		this.$ = {
			filename: n.childNodes[1] as HTMLSpanElement,
		};
		/*
		
		
		if (!this.$.filename) {
			console.error("Failed to resolve item filename on path .childNodes[1] of ", n);
			debugger;
		} else {
			console.log("filename resolved to ", this.$.filename);
		}
		
		*/
		this.el = n;
	}
}
export class CommitMessageDialog {
	protected static _template : HTMLUnknownElement;
	public el : HTMLUnknownElement;
	public $ : R.CommitMessageDialog;
	constructor() {
		let t = CommitMessageDialog._template;
		if (! t ) {
			let d = document.createElement('div');
			d.innerHTML = `<div>
	<h1>Title</h1>
	<div>Instructions</div>
	<fieldset>
		<label for="commitMessage">Describe your changes
		<input type="text" name="commitMessage" id="commitMessage"/>
		</label>
	</fieldset>
	<button class="btn">Commit</button>
</div>
`;
			t = d.firstElementChild as HTMLUnknownElement;
			CommitMessageDialog._template = t;
		}
		let n = t.cloneNode(true) as HTMLUnknownElement;
		
		this.$ = {
			title: n.childNodes[1] as HTMLHeadingElement,
			instructions: n.childNodes[3] as HTMLDivElement,
			message: n.childNodes[5].childNodes[1].childNodes[1] as HTMLInputElement,
			commit: n.childNodes[7] as HTMLButtonElement,
		};
		/*
		
		
		if (!this.$.title) {
			console.error("Failed to resolve item title on path .childNodes[1] of ", n);
			debugger;
		} else {
			console.log("title resolved to ", this.$.title);
		}
		
		
		if (!this.$.instructions) {
			console.error("Failed to resolve item instructions on path .childNodes[3] of ", n);
			debugger;
		} else {
			console.log("instructions resolved to ", this.$.instructions);
		}
		
		
		if (!this.$.message) {
			console.error("Failed to resolve item message on path .childNodes[5].childNodes[1].childNodes[1] of ", n);
			debugger;
		} else {
			console.log("message resolved to ", this.$.message);
		}
		
		
		if (!this.$.commit) {
			console.error("Failed to resolve item commit on path .childNodes[7] of ", n);
			debugger;
		} else {
			console.log("commit resolved to ", this.$.commit);
		}
		
		*/
		this.el = n;
	}
}
export class CommitSummaryListView {
	protected static _template : HTMLUnknownElement;
	public el : HTMLUnknownElement;
	public $ : R.CommitSummaryListView;
	constructor() {
		let t = CommitSummaryListView._template;
		if (! t ) {
			let d = document.createElement('div');
			d.innerHTML = `<div class="commit-summary-list">
</div>
`;
			t = d.firstElementChild as HTMLUnknownElement;
			CommitSummaryListView._template = t;
		}
		let n = t.cloneNode(true) as HTMLUnknownElement;
		
		this.$ = {
			summaries: n as HTMLDivElement,
		};
		/*
		
		
		if (!this.$.summaries) {
			console.error("Failed to resolve item summaries on path  of ", n);
			debugger;
		} else {
			console.log("summaries resolved to ", this.$.summaries);
		}
		
		*/
		this.el = n;
	}
}
export class CommitSummaryView {
	protected static _template : HTMLUnknownElement;
	public el : HTMLUnknownElement;
	public $ : R.CommitSummaryView;
	constructor() {
		let t = CommitSummaryView._template;
		if (! t ) {
			let d = document.createElement('div');
			d.innerHTML = `<div class="commit-summary">
  <div class="when"> </div>
  <div class="message"> </div>
</div>
`;
			t = d.firstElementChild as HTMLUnknownElement;
			CommitSummaryView._template = t;
		}
		let n = t.cloneNode(true) as HTMLUnknownElement;
		
		this.$ = {
			when: n.childNodes[1] as HTMLDivElement,
			message: n.childNodes[3] as HTMLDivElement,
		};
		/*
		
		
		if (!this.$.when) {
			console.error("Failed to resolve item when on path .childNodes[1] of ", n);
			debugger;
		} else {
			console.log("when resolved to ", this.$.when);
		}
		
		
		if (!this.$.message) {
			console.error("Failed to resolve item message on path .childNodes[3] of ", n);
			debugger;
		} else {
			console.log("message resolved to ", this.$.message);
		}
		
		*/
		this.el = n;
	}
}
export class EditorImage {
	protected static _template : HTMLUnknownElement;
	public el : HTMLUnknownElement;
	public $ : R.EditorImage;
	constructor() {
		let t = EditorImage._template;
		if (! t ) {
			let d = document.createElement('div');
			d.innerHTML = `<div> </div>
`;
			t = d.firstElementChild as HTMLUnknownElement;
			EditorImage._template = t;
		}
		let n = t.cloneNode(true) as HTMLUnknownElement;
		
		this.$ = {
		};
		/*
		
		*/
		this.el = n;
	}
}
export class FSFileList_File {
	protected static _template : HTMLUnknownElement;
	public el : HTMLUnknownElement;
	public $ : R.FSFileList_File;
	constructor() {
		let t = FSFileList_File._template;
		if (! t ) {
			let d = document.createElement('div');
			d.innerHTML = `<ul>
	<li data-set="this" class="allfiles-file">
		<div data-event="click:clickFile">NAME
		</div>
	</li>
</ul>
`;
			t = d.firstElementChild.childNodes[1] as HTMLUnknownElement;
			FSFileList_File._template = t;
		}
		let n = t.cloneNode(true) as HTMLUnknownElement;
		
		n = n.childNodes[1] as HTMLLIElement;
		this.$ = {
			name: n as HTMLDivElement,
		};
		/*
		
		
		
		if (!this.$.name) {
			console.error("Failed to resolve item name on path  of ", n);
			debugger;
		} else {
			console.log("name resolved to ", this.$.name);
		}
		
		*/
		this.el = n;
	}
}
export class FileListDialog {
	protected static _template : HTMLUnknownElement;
	public el : HTMLUnknownElement;
	public $ : R.FileListDialog;
	constructor() {
		let t = FileListDialog._template;
		if (! t ) {
			let d = document.createElement('div');
			d.innerHTML = `<div>
	<h1>Print Version</h1>
	<p>Choose the project version you want to print:</p>
	<ul class="file-list-dialog-list">
	</ul>
</div>
`;
			t = d.firstElementChild as HTMLUnknownElement;
			FileListDialog._template = t;
		}
		let n = t.cloneNode(true) as HTMLUnknownElement;
		
		this.$ = {
			list: n.childNodes[5] as HTMLUListElement,
		};
		/*
		
		
		if (!this.$.list) {
			console.error("Failed to resolve item list on path .childNodes[5] of ", n);
			debugger;
		} else {
			console.log("list resolved to ", this.$.list);
		}
		
		*/
		this.el = n;
	}
}
export class FileListDialog_Item {
	protected static _template : HTMLUnknownElement;
	public el : HTMLUnknownElement;
	public $ : R.FileListDialog_Item;
	constructor() {
		let t = FileListDialog_Item._template;
		if (! t ) {
			let d = document.createElement('div');
			d.innerHTML = `<ul>
	<li data-set="this">
		<input type="radio" name="file-list"/>
		<span/>
	</li>
</ul>
`;
			t = d.firstElementChild.childNodes[1] as HTMLUnknownElement;
			FileListDialog_Item._template = t;
		}
		let n = t.cloneNode(true) as HTMLUnknownElement;
		
		n = n.childNodes[1] as HTMLLIElement;
		this.$ = {
			input: n as HTMLInputElement,
			title: n as HTMLSpanElement,
		};
		/*
		
		
		
		if (!this.$.input) {
			console.error("Failed to resolve item input on path  of ", n);
			debugger;
		} else {
			console.log("input resolved to ", this.$.input);
		}
		
		
		if (!this.$.title) {
			console.error("Failed to resolve item title on path  of ", n);
			debugger;
		} else {
			console.log("title resolved to ", this.$.title);
		}
		
		*/
		this.el = n;
	}
}
export class FileTree_Dir {
	protected static _template : HTMLUnknownElement;
	public el : HTMLUnknownElement;
	public $ : R.FileTree_Dir;
	constructor() {
		let t = FileTree_Dir._template;
		if (! t ) {
			let d = document.createElement('div');
			d.innerHTML = `<div class="dir">
	<div class="name">
	</div>
	<div class="elements">
	</div>
</div>
`;
			t = d.firstElementChild as HTMLUnknownElement;
			FileTree_Dir._template = t;
		}
		let n = t.cloneNode(true) as HTMLUnknownElement;
		
		this.$ = {
			name: n.childNodes[1] as HTMLDivElement,
			elements: n.childNodes[3] as HTMLDivElement,
		};
		/*
		
		
		if (!this.$.name) {
			console.error("Failed to resolve item name on path .childNodes[1] of ", n);
			debugger;
		} else {
			console.log("name resolved to ", this.$.name);
		}
		
		
		if (!this.$.elements) {
			console.error("Failed to resolve item elements on path .childNodes[3] of ", n);
			debugger;
		} else {
			console.log("elements resolved to ", this.$.elements);
		}
		
		*/
		this.el = n;
	}
}
export class FoundationRevealDialog {
	protected static _template : HTMLUnknownElement;
	public el : HTMLUnknownElement;
	public $ : R.FoundationRevealDialog;
	constructor() {
		let t = FoundationRevealDialog._template;
		if (! t ) {
			let d = document.createElement('div');
			d.innerHTML = `<div class="reveal" id="new-file-dialog" data-reveal="">
	<div class="content">
	</div>
	<button aria-label="Close popup" type="button" data-close="" class="close-button">
		<span aria-hidden="true">×</span>
	</button>
</div>
`;
			t = d.firstElementChild as HTMLUnknownElement;
			FoundationRevealDialog._template = t;
		}
		let n = t.cloneNode(true) as HTMLUnknownElement;
		
		this.$ = {
			content: n.childNodes[1] as HTMLDivElement,
		};
		/*
		
		
		if (!this.$.content) {
			console.error("Failed to resolve item content on path .childNodes[1] of ", n);
			debugger;
		} else {
			console.log("content resolved to ", this.$.content);
		}
		
		*/
		this.el = n;
	}
}
export class LoginTokenDisplay {
	protected static _template : HTMLUnknownElement;
	public el : HTMLUnknownElement;
	public $ : R.LoginTokenDisplay;
	constructor() {
		let t = LoginTokenDisplay._template;
		if (! t ) {
			let d = document.createElement('div');
			d.innerHTML = `<ul>
	<li data-set="this" class="token-display">
		<a href="">LINK</a>
		<a href="">X</a>
	</li>
</ul>
`;
			t = d.firstElementChild.childNodes[1] as HTMLUnknownElement;
			LoginTokenDisplay._template = t;
		}
		let n = t.cloneNode(true) as HTMLUnknownElement;
		
		n = n.childNodes[1] as HTMLLIElement;
		this.$ = {
			link: n as HTMLAnchorElement,
			delete: n as HTMLAnchorElement,
		};
		/*
		
		
		
		if (!this.$.link) {
			console.error("Failed to resolve item link on path  of ", n);
			debugger;
		} else {
			console.log("link resolved to ", this.$.link);
		}
		
		
		if (!this.$.delete) {
			console.error("Failed to resolve item delete on path  of ", n);
			debugger;
		} else {
			console.log("delete resolved to ", this.$.delete);
		}
		
		*/
		this.el = n;
	}
}
export class LoginTokenList {
	protected static _template : HTMLUnknownElement;
	public el : HTMLUnknownElement;
	public $ : R.LoginTokenList;
	constructor() {
		let t = LoginTokenList._template;
		if (! t ) {
			let d = document.createElement('div');
			d.innerHTML = `<div class="login-token-list">
	<div class="token-input">
		<input type="text" placeholder="name"/>
		<input type="text" placeholder="token"/>
		<button class="btn">Add</button>
	</div>
	<ul class="token-list">
	</ul>
</div>
`;
			t = d.firstElementChild as HTMLUnknownElement;
			LoginTokenList._template = t;
		}
		let n = t.cloneNode(true) as HTMLUnknownElement;
		
		this.$ = {
			name: n.childNodes[1].childNodes[1] as HTMLInputElement,
			token: n.childNodes[1].childNodes[3] as HTMLInputElement,
			add: n.childNodes[1].childNodes[5] as HTMLButtonElement,
			list: n.childNodes[3] as HTMLUListElement,
		};
		/*
		
		
		if (!this.$.name) {
			console.error("Failed to resolve item name on path .childNodes[1].childNodes[1] of ", n);
			debugger;
		} else {
			console.log("name resolved to ", this.$.name);
		}
		
		
		if (!this.$.token) {
			console.error("Failed to resolve item token on path .childNodes[1].childNodes[3] of ", n);
			debugger;
		} else {
			console.log("token resolved to ", this.$.token);
		}
		
		
		if (!this.$.add) {
			console.error("Failed to resolve item add on path .childNodes[1].childNodes[5] of ", n);
			debugger;
		} else {
			console.log("add resolved to ", this.$.add);
		}
		
		
		if (!this.$.list) {
			console.error("Failed to resolve item list on path .childNodes[3] of ", n);
			debugger;
		} else {
			console.log("list resolved to ", this.$.list);
		}
		
		*/
		this.el = n;
	}
}
export class MergeEditor {
	protected static _template : HTMLUnknownElement;
	public el : HTMLUnknownElement;
	public $ : R.MergeEditor;
	constructor() {
		let t = MergeEditor._template;
		if (! t ) {
			let d = document.createElement('div');
			d.innerHTML = `<div class="merge-editor">
	<div class="action-group">
		<button data-event="click:save" class="btn">Save</button>
	</div>
	<div class="merge-mergely">
	</div>
</div>
`;
			t = d.firstElementChild as HTMLUnknownElement;
			MergeEditor._template = t;
		}
		let n = t.cloneNode(true) as HTMLUnknownElement;
		
		this.$ = {
			mergely: n.childNodes[3] as HTMLDivElement,
		};
		/*
		
		
		if (!this.$.mergely) {
			console.error("Failed to resolve item mergely on path .childNodes[3] of ", n);
			debugger;
		} else {
			console.log("mergely resolved to ", this.$.mergely);
		}
		
		*/
		this.el = n;
	}
}
export class PrintListenerTerminal {
	protected static _template : HTMLUnknownElement;
	public el : HTMLUnknownElement;
	public $ : R.PrintListenerTerminal;
	constructor() {
		let t = PrintListenerTerminal._template;
		if (! t ) {
			let d = document.createElement('div');
			d.innerHTML = `<div id="print-listener">
	<div class="header">
		<div class="title">Printing in progress...
		</div>
		<div class="close">X</div>
	</div>
	<div class="terminal">
	</div>
</div>
`;
			t = d.firstElementChild as HTMLUnknownElement;
			PrintListenerTerminal._template = t;
		}
		let n = t.cloneNode(true) as HTMLUnknownElement;
		
		this.$ = {
			header: n.childNodes[1] as HTMLDivElement,
			title: n.childNodes[1].childNodes[1] as HTMLDivElement,
			close: n.childNodes[1].childNodes[3] as HTMLDivElement,
			terminal: n.childNodes[3] as HTMLDivElement,
		};
		/*
		
		
		if (!this.$.header) {
			console.error("Failed to resolve item header on path .childNodes[1] of ", n);
			debugger;
		} else {
			console.log("header resolved to ", this.$.header);
		}
		
		
		if (!this.$.title) {
			console.error("Failed to resolve item title on path .childNodes[1].childNodes[1] of ", n);
			debugger;
		} else {
			console.log("title resolved to ", this.$.title);
		}
		
		
		if (!this.$.close) {
			console.error("Failed to resolve item close on path .childNodes[1].childNodes[3] of ", n);
			debugger;
		} else {
			console.log("close resolved to ", this.$.close);
		}
		
		
		if (!this.$.terminal) {
			console.error("Failed to resolve item terminal on path .childNodes[3] of ", n);
			debugger;
		} else {
			console.log("terminal resolved to ", this.$.terminal);
		}
		
		*/
		this.el = n;
	}
}
export class PullRequestDiffList_File {
	protected static _template : HTMLUnknownElement;
	public el : HTMLUnknownElement;
	public $ : R.PullRequestDiffList_File;
	constructor() {
		let t = PullRequestDiffList_File._template;
		if (! t ) {
			let d = document.createElement('div');
			d.innerHTML = `<div>
</div>
`;
			t = d.firstElementChild as HTMLUnknownElement;
			PullRequestDiffList_File._template = t;
		}
		let n = t.cloneNode(true) as HTMLUnknownElement;
		
		this.$ = {
		};
		/*
		
		*/
		this.el = n;
	}
}
export class RepoEditorPage_NewFileDialog {
	protected static _template : HTMLUnknownElement;
	public el : HTMLUnknownElement;
	public $ : R.RepoEditorPage_NewFileDialog;
	constructor() {
		let t = RepoEditorPage_NewFileDialog._template;
		if (! t ) {
			let d = document.createElement('div');
			d.innerHTML = `<div>
	<fieldset>
		<label>
			Enter the full path to your new file.
			<input placeholder="book/text/chapter-7.md" data-event="change" type="text"/>
		</label>
	</fieldset>
	<button class="btn" data-event="click">Create File</button>
</div>
`;
			t = d.firstElementChild as HTMLUnknownElement;
			RepoEditorPage_NewFileDialog._template = t;
		}
		let n = t.cloneNode(true) as HTMLUnknownElement;
		
		this.$ = {
			filename: n.childNodes[1].childNodes[1].childNodes[1] as HTMLInputElement,
		};
		/*
		
		
		if (!this.$.filename) {
			console.error("Failed to resolve item filename on path .childNodes[1].childNodes[1].childNodes[1] of ", n);
			debugger;
		} else {
			console.log("filename resolved to ", this.$.filename);
		}
		
		*/
		this.el = n;
	}
}
export class RepoEditorPage_RenameFileDialog {
	protected static _template : HTMLUnknownElement;
	public el : HTMLUnknownElement;
	public $ : R.RepoEditorPage_RenameFileDialog;
	constructor() {
		let t = RepoEditorPage_RenameFileDialog._template;
		if (! t ) {
			let d = document.createElement('div');
			d.innerHTML = `<div>
	<div class="error">
	</div>
	<fieldset>
		<div>Renaming <span> </span></div>
		<label>
			Enter the full path to your new file.
			<input type="text" placeholder="/book/text/chapter-7.md" data-event="change"/>
		</label>
	</fieldset>
	<button class="btn" data-event="click">Rename</button>
</div>
`;
			t = d.firstElementChild as HTMLUnknownElement;
			RepoEditorPage_RenameFileDialog._template = t;
		}
		let n = t.cloneNode(true) as HTMLUnknownElement;
		
		this.$ = {
			error: n.childNodes[1] as HTMLDivElement,
			current_name: n.childNodes[3].childNodes[1].childNodes[1] as HTMLSpanElement,
			filename: n.childNodes[3].childNodes[3].childNodes[1] as HTMLInputElement,
		};
		/*
		
		
		if (!this.$.error) {
			console.error("Failed to resolve item error on path .childNodes[1] of ", n);
			debugger;
		} else {
			console.log("error resolved to ", this.$.error);
		}
		
		
		if (!this.$.current_name) {
			console.error("Failed to resolve item current_name on path .childNodes[3].childNodes[1].childNodes[1] of ", n);
			debugger;
		} else {
			console.log("current_name resolved to ", this.$.current_name);
		}
		
		
		if (!this.$.filename) {
			console.error("Failed to resolve item filename on path .childNodes[3].childNodes[3].childNodes[1] of ", n);
			debugger;
		} else {
			console.log("filename resolved to ", this.$.filename);
		}
		
		*/
		this.el = n;
	}
}
export class RepoFileEditorCM {
	protected static _template : HTMLUnknownElement;
	public el : HTMLUnknownElement;
	public $ : R.RepoFileEditorCM;
	constructor() {
		let t = RepoFileEditorCM._template;
		if (! t ) {
			let d = document.createElement('div');
			d.innerHTML = `<div class="repo-file-editor-workspace">
	<div class="repo-file-editor">
	</div>
	<div class="repo-image-editor">
	</div>
</div>
`;
			t = d.firstElementChild as HTMLUnknownElement;
			RepoFileEditorCM._template = t;
		}
		let n = t.cloneNode(true) as HTMLUnknownElement;
		
		this.$ = {
			textEditor: n.childNodes[1] as HTMLDivElement,
			imageEditor: n.childNodes[3] as HTMLDivElement,
		};
		/*
		
		
		if (!this.$.textEditor) {
			console.error("Failed to resolve item textEditor on path .childNodes[1] of ", n);
			debugger;
		} else {
			console.log("textEditor resolved to ", this.$.textEditor);
		}
		
		
		if (!this.$.imageEditor) {
			console.error("Failed to resolve item imageEditor on path .childNodes[3] of ", n);
			debugger;
		} else {
			console.log("imageEditor resolved to ", this.$.imageEditor);
		}
		
		*/
		this.el = n;
	}
}
export class RepoFileViewerFile {
	protected static _template : HTMLUnknownElement;
	public el : HTMLUnknownElement;
	public $ : R.RepoFileViewerFile;
	constructor() {
		let t = RepoFileViewerFile._template;
		if (! t ) {
			let d = document.createElement('div');
			d.innerHTML = `<div class="repo-file-viewer-file">
	<div class="image">
		<img/>
	</div>
	<div class="filename"> </div>
</div>
`;
			t = d.firstElementChild as HTMLUnknownElement;
			RepoFileViewerFile._template = t;
		}
		let n = t.cloneNode(true) as HTMLUnknownElement;
		
		this.$ = {
			img: n.childNodes[1].childNodes[1] as HTMLImageElement,
			filename: n.childNodes[3] as HTMLDivElement,
		};
		/*
		
		
		if (!this.$.img) {
			console.error("Failed to resolve item img on path .childNodes[1].childNodes[1] of ", n);
			debugger;
		} else {
			console.log("img resolved to ", this.$.img);
		}
		
		
		if (!this.$.filename) {
			console.error("Failed to resolve item filename on path .childNodes[3] of ", n);
			debugger;
		} else {
			console.log("filename resolved to ", this.$.filename);
		}
		
		*/
		this.el = n;
	}
}
export class RepoFileViewerPage {
	protected static _template : HTMLUnknownElement;
	public el : HTMLUnknownElement;
	public $ : R.RepoFileViewerPage;
	constructor() {
		let t = RepoFileViewerPage._template;
		if (! t ) {
			let d = document.createElement('div');
			d.innerHTML = `<div class="repo-file-viewer">
	<div class="searchbar">
		<input type="text" placeholder="Enter search text to find images."/>
	</div>
	<div class="data">
	</div>
</div>
`;
			t = d.firstElementChild as HTMLUnknownElement;
			RepoFileViewerPage._template = t;
		}
		let n = t.cloneNode(true) as HTMLUnknownElement;
		
		this.$ = {
			search: n.childNodes[1].childNodes[1] as HTMLInputElement,
			data: n.childNodes[3] as HTMLDivElement,
		};
		/*
		
		
		if (!this.$.search) {
			console.error("Failed to resolve item search on path .childNodes[1].childNodes[1] of ", n);
			debugger;
		} else {
			console.log("search resolved to ", this.$.search);
		}
		
		
		if (!this.$.data) {
			console.error("Failed to resolve item data on path .childNodes[3] of ", n);
			debugger;
		} else {
			console.log("data resolved to ", this.$.data);
		}
		
		*/
		this.el = n;
	}
}
export class RepoMergeDialog {
	protected static _template : HTMLUnknownElement;
	public el : HTMLUnknownElement;
	public $ : R.RepoMergeDialog;
	constructor() {
		let t = RepoMergeDialog._template;
		if (! t ) {
			let d = document.createElement('div');
			d.innerHTML = `<div>
	<h1>Updating a Repo</h1>
	<p>How do you want to try this merge?</p>
	<fieldset>
		<label for="resolveOur">
			<input id="resolveOur" type="radio" name="resolve" value="our"/>
			I will do the merge.
		</label>
		<label for="resolveGit">
			<input id="resolveGit" type="radio" name="resolve" value="git"/>
			Git can try to merge.
		</label>
		<label for="resolveTheir">
			<input name="resolve" value="their" id="resolveTheir" type="radio"/>
			Choose their files by preference.
		</label>
	</fieldset>
	<label for="conflicted">
		<input type="checkbox" name="conflicted" value="only" id="conflicted"/>
			Only apply above resolution to conflicted files.
	</label>
	<button class="btn" data-event="click:">Do the Merge</button>
</div>
`;
			t = d.firstElementChild as HTMLUnknownElement;
			RepoMergeDialog._template = t;
		}
		let n = t.cloneNode(true) as HTMLUnknownElement;
		
		this.$ = {
			title: n.childNodes[1] as HTMLHeadingElement,
			resolveOur: n.childNodes[5].childNodes[1].childNodes[1] as HTMLInputElement,
			resolveGit: n.childNodes[5].childNodes[3].childNodes[1] as HTMLInputElement,
			resolveTheir: n.childNodes[5].childNodes[5].childNodes[1] as HTMLInputElement,
			conflicted: n.childNodes[7].childNodes[1] as HTMLInputElement,
			mergeButton: n.childNodes[9] as HTMLButtonElement,
		};
		/*
		
		
		if (!this.$.title) {
			console.error("Failed to resolve item title on path .childNodes[1] of ", n);
			debugger;
		} else {
			console.log("title resolved to ", this.$.title);
		}
		
		
		if (!this.$.resolveOur) {
			console.error("Failed to resolve item resolveOur on path .childNodes[5].childNodes[1].childNodes[1] of ", n);
			debugger;
		} else {
			console.log("resolveOur resolved to ", this.$.resolveOur);
		}
		
		
		if (!this.$.resolveGit) {
			console.error("Failed to resolve item resolveGit on path .childNodes[5].childNodes[3].childNodes[1] of ", n);
			debugger;
		} else {
			console.log("resolveGit resolved to ", this.$.resolveGit);
		}
		
		
		if (!this.$.resolveTheir) {
			console.error("Failed to resolve item resolveTheir on path .childNodes[5].childNodes[5].childNodes[1] of ", n);
			debugger;
		} else {
			console.log("resolveTheir resolved to ", this.$.resolveTheir);
		}
		
		
		if (!this.$.conflicted) {
			console.error("Failed to resolve item conflicted on path .childNodes[7].childNodes[1] of ", n);
			debugger;
		} else {
			console.log("conflicted resolved to ", this.$.conflicted);
		}
		
		
		if (!this.$.mergeButton) {
			console.error("Failed to resolve item mergeButton on path .childNodes[9] of ", n);
			debugger;
		} else {
			console.log("mergeButton resolved to ", this.$.mergeButton);
		}
		
		*/
		this.el = n;
	}
}
export class Tree_NodeView {
	protected static _template : HTMLUnknownElement;
	public el : HTMLUnknownElement;
	public $ : R.Tree_NodeView;
	constructor() {
		let t = Tree_NodeView._template;
		if (! t ) {
			let d = document.createElement('div');
			d.innerHTML = `<div class="node">
	<div class="name"><span class="closer"><!-- icon inserted by CSS --></span><span>NAME</span></div>
	<div class="children"> </div>
</div>
`;
			t = d.firstElementChild as HTMLUnknownElement;
			Tree_NodeView._template = t;
		}
		let n = t.cloneNode(true) as HTMLUnknownElement;
		
		this.$ = {
			close: n.childNodes[1].childNodes[0] as HTMLSpanElement,
			name: n.childNodes[1].childNodes[1] as HTMLSpanElement,
			children: n.childNodes[3] as HTMLDivElement,
		};
		/*
		
		
		if (!this.$.close) {
			console.error("Failed to resolve item close on path .childNodes[1].childNodes[0] of ", n);
			debugger;
		} else {
			console.log("close resolved to ", this.$.close);
		}
		
		
		if (!this.$.name) {
			console.error("Failed to resolve item name on path .childNodes[1].childNodes[1] of ", n);
			debugger;
		} else {
			console.log("name resolved to ", this.$.name);
		}
		
		
		if (!this.$.children) {
			console.error("Failed to resolve item children on path .childNodes[3] of ", n);
			debugger;
		} else {
			console.log("children resolved to ", this.$.children);
		}
		
		*/
		this.el = n;
	}
}
export class conflict_ClosePRDialog {
	protected static _template : HTMLUnknownElement;
	public el : HTMLUnknownElement;
	public $ : R.conflict_ClosePRDialog;
	constructor() {
		let t = conflict_ClosePRDialog._template;
		if (! t ) {
			let d = document.createElement('div');
			d.innerHTML = `<div>
	<h1>Title</h1>
	<div>Instructions</div>
	<fieldset>
		<label for="closePR-no">
		<input type="radio" name="closePR" id="closePR-no" value="no" data-event="change"/>No
		</label>
		<label for="closePR-yes">
		<input type="radio" name="closePR" id="closePR-yes" value="yes" data-event="change"/>Yes
		</label>
		<label for="closeMessage">Close message
		<input type="text" name="closeMessage" id="closeMessage"/>
		</label>
	</fieldset> 
	<button class="btn" data-event="click:done">Done</button>
</div>
`;
			t = d.firstElementChild as HTMLUnknownElement;
			conflict_ClosePRDialog._template = t;
		}
		let n = t.cloneNode(true) as HTMLUnknownElement;
		
		this.$ = {
			title: n.childNodes[1] as HTMLHeadingElement,
			instructions: n.childNodes[3] as HTMLDivElement,
			closePR_no: n.childNodes[5].childNodes[1].childNodes[1] as HTMLInputElement,
			closePR_yes: n.childNodes[5].childNodes[3].childNodes[1] as HTMLInputElement,
			closeMessage: n.childNodes[5].childNodes[5].childNodes[1] as HTMLInputElement,
		};
		/*
		
		
		if (!this.$.title) {
			console.error("Failed to resolve item title on path .childNodes[1] of ", n);
			debugger;
		} else {
			console.log("title resolved to ", this.$.title);
		}
		
		
		if (!this.$.instructions) {
			console.error("Failed to resolve item instructions on path .childNodes[3] of ", n);
			debugger;
		} else {
			console.log("instructions resolved to ", this.$.instructions);
		}
		
		
		if (!this.$.closePR_no) {
			console.error("Failed to resolve item closePR_no on path .childNodes[5].childNodes[1].childNodes[1] of ", n);
			debugger;
		} else {
			console.log("closePR_no resolved to ", this.$.closePR_no);
		}
		
		
		if (!this.$.closePR_yes) {
			console.error("Failed to resolve item closePR_yes on path .childNodes[5].childNodes[3].childNodes[1] of ", n);
			debugger;
		} else {
			console.log("closePR_yes resolved to ", this.$.closePR_yes);
		}
		
		
		if (!this.$.closeMessage) {
			console.error("Failed to resolve item closeMessage on path .childNodes[5].childNodes[5].childNodes[1] of ", n);
			debugger;
		} else {
			console.log("closeMessage resolved to ", this.$.closeMessage);
		}
		
		*/
		this.el = n;
	}
}
export class conflict_FileDisplay {
	protected static _template : HTMLUnknownElement;
	public el : HTMLUnknownElement;
	public $ : R.conflict_FileDisplay;
	constructor() {
		let t = conflict_FileDisplay._template;
		if (! t ) {
			let d = document.createElement('div');
			d.innerHTML = `<li class="file-display">
	<span class="path"> </span>
	<span class="status"> </span>
</li>
`;
			t = d.firstElementChild as HTMLUnknownElement;
			conflict_FileDisplay._template = t;
		}
		let n = t.cloneNode(true) as HTMLUnknownElement;
		
		this.$ = {
			path: n.childNodes[1] as HTMLSpanElement,
			status: n.childNodes[3] as HTMLSpanElement,
		};
		/*
		
		
		if (!this.$.path) {
			console.error("Failed to resolve item path on path .childNodes[1] of ", n);
			debugger;
		} else {
			console.log("path resolved to ", this.$.path);
		}
		
		
		if (!this.$.status) {
			console.error("Failed to resolve item status on path .childNodes[3] of ", n);
			debugger;
		} else {
			console.log("status resolved to ", this.$.status);
		}
		
		*/
		this.el = n;
	}
}
export class conflict_FileListDisplay {
	protected static _template : HTMLUnknownElement;
	public el : HTMLUnknownElement;
	public $ : R.conflict_FileListDisplay;
	constructor() {
		let t = conflict_FileListDisplay._template;
		if (! t ) {
			let d = document.createElement('div');
			d.innerHTML = `<ul class="conflict-file-list-display">
</ul>
`;
			t = d.firstElementChild as HTMLUnknownElement;
			conflict_FileListDisplay._template = t;
		}
		let n = t.cloneNode(true) as HTMLUnknownElement;
		
		this.$ = {
		};
		/*
		
		*/
		this.el = n;
	}
}
export class conflict_MergeImageEditor {
	protected static _template : HTMLUnknownElement;
	public el : HTMLUnknownElement;
	public $ : R.conflict_MergeImageEditor;
	constructor() {
		let t = conflict_MergeImageEditor._template;
		if (! t ) {
			let d = document.createElement('div');
			d.innerHTML = `<div id="merge-image-editor" class="merge-image-editor">
	<div>
	</div>
	<div>
	</div>
</div>
`;
			t = d.firstElementChild as HTMLUnknownElement;
			conflict_MergeImageEditor._template = t;
		}
		let n = t.cloneNode(true) as HTMLUnknownElement;
		
		this.$ = {
			ours: n.childNodes[1] as HTMLDivElement,
			theirs: n.childNodes[3] as HTMLDivElement,
		};
		/*
		
		
		if (!this.$.ours) {
			console.error("Failed to resolve item ours on path .childNodes[1] of ", n);
			debugger;
		} else {
			console.log("ours resolved to ", this.$.ours);
		}
		
		
		if (!this.$.theirs) {
			console.error("Failed to resolve item theirs on path .childNodes[3] of ", n);
			debugger;
		} else {
			console.log("theirs resolved to ", this.$.theirs);
		}
		
		*/
		this.el = n;
	}
}
export class conflict_MergeInstructions {
	protected static _template : HTMLUnknownElement;
	public el : HTMLUnknownElement;
	public $ : R.conflict_MergeInstructions;
	constructor() {
		let t = conflict_MergeInstructions._template;
		if (! t ) {
			let d = document.createElement('div');
			d.innerHTML = `<div class="merge-instructions">
	<div class="instructions-button">?</div>
	<div class="instructions-text">
		<h1>Working with the merge editor</h1>
		<p>The file being submitted is displayed in the editor on the <span class="editor-side">THEIRSIDE</span> side.</p>
		<p>The final file you will save is displayed in the editor on the <span class="editor-side">OURSIDE</span> side.</p>
		<p>Use the small buttons to the left of lines to transfer changes between sides.</p>
		<p>When you are satisfied with your changes, press 'Save these changes' to save your changes.</p>
		<p>When you have resolved all the issues between all the files, press 'Resolve this merge' to resolve the conflicted state.</p>
	</div>
</div>
`;
			t = d.firstElementChild as HTMLUnknownElement;
			conflict_MergeInstructions._template = t;
		}
		let n = t.cloneNode(true) as HTMLUnknownElement;
		
		this.$ = {
			show: n.childNodes[1] as HTMLDivElement,
			text: n.childNodes[3] as HTMLDivElement,
			theirSide: n.childNodes[3].childNodes[3].childNodes[1] as HTMLSpanElement,
			ourSide: n.childNodes[3].childNodes[5].childNodes[1] as HTMLSpanElement,
		};
		/*
		
		
		if (!this.$.show) {
			console.error("Failed to resolve item show on path .childNodes[1] of ", n);
			debugger;
		} else {
			console.log("show resolved to ", this.$.show);
		}
		
		
		if (!this.$.text) {
			console.error("Failed to resolve item text on path .childNodes[3] of ", n);
			debugger;
		} else {
			console.log("text resolved to ", this.$.text);
		}
		
		
		if (!this.$.theirSide) {
			console.error("Failed to resolve item theirSide on path .childNodes[3].childNodes[3].childNodes[1] of ", n);
			debugger;
		} else {
			console.log("theirSide resolved to ", this.$.theirSide);
		}
		
		
		if (!this.$.ourSide) {
			console.error("Failed to resolve item ourSide on path .childNodes[3].childNodes[5].childNodes[1] of ", n);
			debugger;
		} else {
			console.log("ourSide resolved to ", this.$.ourSide);
		}
		
		*/
		this.el = n;
	}
}

