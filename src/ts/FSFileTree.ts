import {API} from './API';
// import {Directory} from './Directory';
import {EBW} from './EBW';
import {RepoFileEditorCM} from './RepoFileEditorCM';
import {FSFileList_File} from './FSFileList_File';
import {FSNotify} from './FS/FSNotify';
import {FileContent, FileStat} from './FS/FS';
import {FSFileEdit} from './FS/FSFileEdit';

import {FileSystem} from './Tree/FileSystem';
import {Node,NodeType} from './Tree/Node';
import {FileSystemView} from './Tree/FileSystemView';
import {FSNotify} from 'FS/FSNotify';
import {Context} from './Context';

/**
 * FSFileTree shows a list of the files in the 
 * given filesystem. This is a UI Element that connects to an FS via a FSNotify
 */
export class FSFileTree {
	protected api: API;
	protected FileSystem: FileSystem;
	protected View : FileSystemView;

	protected root: Node;

	constructor(
		protected context:Context,
		protected parent:HTMLElement,
		protected editor: RepoFileEditorCM,
		protected FS:FSNotify,
		protected ignoreFunction: (name:string)=>boolean) 
	{
		this.api = EBW.API();
		this.FS.Listeners.add(this.FSEvent, this);		
		this.root = new Node(null, ``, NodeType.DIR, null);
		this.FileSystem = new FileSystem(this.root);
		this.View = new FileSystemView(this.context, this.FileSystem, parent, this.ignoreFunction, this.FS);

		parent.addEventListener(`ebw-FileClicked`, (evt)=>{
			let n:Node= evt.detail as Node;
			let fc:FileContent = n.data as FileContent;
			this.FS.Read(fc.Name)
			.then(
				(fc:FileContent)=>{
					this.editor.setFile(new FSFileEdit(fc, this.FS));
				});
		});
	}

	FSEvent(path:string, fc:FileContent) {
		if (!fc) {
			debugger;
		}
		switch (fc.Stat) {
			case FileStat.New:
				//	fallthrough
			case FileStat.Exists:
				// fallthrough
			case FileStat.Changed:
				this.FileSystem.FindOrCreateFileNode(path, fc);
				// if (!f) {
				// 	this.newFile(fc);
				// }
				break;
			case FileStat.Deleted:
				// Nothing to do - filelist_file will handle
				// css style change.
				break;
			case FileStat.NotExist:
				break;
		}
	}
	newFile(fc:FileContent) : FSFileList_File {
		/*
		let f = new FSFileList_File(this.parent, fc, this.FS, {
			clickFile: (evt:any)=>{
				this.FS.Read(fc.Name)
				.then(
					(fc:FileContent)=>{
						let edit = new FSFileEdit(fc, this.FS);
						this.editor.setFile(edit);
					});
			}
		},
		this.ignoreFunction);
		this.files.set(fc.Name, f);
		return f;
		*/
	}

}
