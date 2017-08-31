import {Context} from './Context';
import {DOMInsert} from './DOMInsert';
import {EBW} from './EBW';
import {RepoFileViewerPage as Template} from './Templates';
import {RepoFileViewerFile} from './RepoFileViewerFile';

interface EditFieldListener {
	ValueChanged(v:string):void;
}

class EditField {
	protected value:string;
	constructor(protected el:HTMLInputElement, protected page:EditFieldListener) {
		this.value = el.value;
		this.el.addEventListener(`keyup`, (evt)=>{
			let v = el.value;
			if (v!=this.value) {
				this.value = v;
				page.ValueChanged(v);
			}
		});
	}
}

interface LoadFilesListener {
	FilesFound(files:string[]):void;
}

class LoadFiles {
	protected searchingFor: string;
	constructor(protected context:Context, protected listener:LoadFilesListener){}
	Search(s:string):void {
		console.log(`LoadFiles.Search(${s})`);
		this.searchingFor = s;
		EBW.API()
		.SearchForFiles(this.context.RepoOwner, this.context.RepoName, s)
		.then(
			([search, files]:[string, string[]])=>{				
				if (search!=this.searchingFor) {
					return;
				}
				this.listener.FilesFound(files);
			});
	}
}

export class RepoFileViewerPage extends Template implements EditFieldListener {
	protected loadFiles : LoadFiles;
	protected inserter: DOMInsert;
	protected add: RepoFileViewerFile;

	constructor(protected context:Context, parent:HTMLElement) {
		super();
		this.add = new RepoFileViewerFile(this.context, ``, new DOMInsert(this.$.data), this);
		this.inserter = new DOMInsert( (el:HTMLElement)=>{
			this.$.data.insertBefore(el, this.add.el);
		});
		parent.appendChild(this.el);
		this.$.search.focus();
		this.loadFiles = new LoadFiles(context, this);
		new EditField(this.$.search, this);

	}
	ValueChanged(s:string):void {
		s = s + `.*\\.(png|jpg|jpeg|svg|gif|tiff)$`
		this.loadFiles.Search(s);
	}
	FilesFound(files:string[]):void {
		console.log(`FilesFound: `, files);
		let e = this.$.data.firstChild;
		while (e) {
			let next = e.nextSibling;
			if (e!=this.add.el) {
				this.$.data.removeChild(e);
			}
			e = next;
		}
		for (let f of files) {
			new RepoFileViewerFile(this.context, f, this.inserter, this);
		}
	}
	FileDrop(src:RepoFileViewerFile, evt:any) {
			let dt = evt.dataTransfer;

			if (dt.items) {
				for (let i=0; i<dt.items.length; i++) {
					let item = dt.items[i] as DataTransferItem;
					if (item.kind == `file`) {
						//console.log(`filename = `, item.name);
					}
					// READ THE FILE
					let reader = new FileReader();
					reader.addEventListener(`loadend`, (evt)=>{
						//console.log(`READ file. result=`, reader.result);
						//console.log(`Replacing file ${this.filename} with result`);
						let u8 = new Uint8Array(reader.result);	//Uint8Array.from(reader.result);
						//console.log(`u8 = `, u8);
						let blen = u8.byteLength;
						//console.log(`blen = `, blen);
						let binary = ``;
						for (let i=0; i<blen; i++) {
							binary += String.fromCharCode( u8[i] );
						}
						let p : Promise<string>;
						if (``!=src.Filename()) {
							p = Promise.resolve<string>(src.Filename());
						} else {
							p = EBW.Prompt(`Enter full path and filename for uploaded file.`);
						}
						p.then(
							(s:string)=>{
								if (``==s) return Promise.resolve<string>(``);
								return EBW.API().UpdateFileBinary(this.context.RepoOwner, this.context.RepoName, s, window.btoa(binary))
								.then(
									()=>{
										return Promise.resolve<string>(s);
									})
							})
						.then(
							(s:string)=>{
								if (``!=s) {
									if (!src.IsAddButton()) {
										src.Refresh();
									} else {
										new RepoFileViewerFile(this.context, s, this.inserter, this);
									}
									EBW.Toast(`Image uploaded`);
								}
							})
						.catch(
							EBW.Error
						);
					});
					reader.readAsArrayBuffer(item.getAsFile());
				}
			} else {
				alert(`dt.files- unexpected file upload result`);
				for (let i=0; i<dt.files.length; i++) {
					let file = dt.files[i];
				}
			}

	}
}