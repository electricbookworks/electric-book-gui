import {API} from './API';
// import {Directory} from './Directory';
import {EBW} from './EBW';
import {RepoFileEditorCM} from './RepoFileEditorCM';
import {FSFileList_File} from './FSFileList_File';
import {FSNotify} from './FS/FSNotify';
import {FileContent, FileStat} from './FS/FS';
import {FSFileEdit} from './FS/FSFileEdit';

/**
 * FSFileList shows a list of the files in the 
 * given filesystem.
 */
export class FSFileList {
	protected api: API;
	protected files: Map<string, FSFileList_File>;
	constructor(
		protected parent:HTMLElement,
		protected editor: RepoFileEditorCM,
		protected FS:FSNotify,
		protected ignoreFunction: (name:string)=>boolean) 
	{
		this.api = EBW.API();
		this.FS.Listeners.add(this.FSEvent, this);
		this.files = new Map<string,FSFileList_File>();
	}
	FSEvent(path:string, fc:FileContent) {
		if (!fc) {
			debugger;
		}
		console.log(`FSFileList.FSEvent -- fileContent = `, fc);
		let f = this.files.get(fc.Name);
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
				// The filelist_file class will handle this itself
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
	}
	newFile(fc:FileContent) : FSFileList_File {
		let f = new FSFileList_File(this.parent, fc, this.FS, {
			clickFile: (evt:any)=>{
				this.FS.Read(fc.Name)
				.then(
					(fc:FileContent)=>{
						console.log(`We've got content: `, fc);
						console.log(`clicked ${fc.Name} - NEED TO SEND TO EDITOR`);
						let edit = new FSFileEdit(fc, this.FS);
						this.editor.setFile(edit);
					});
				// TODO :: Need to send a RepoFileModel to the
				// editor...
				// let m = this.fileCache.Create(fileInfo);
				// this.editor.setFile(m);
			}
		},
		this.ignoreFunction);
		this.files.set(fc.Name, f);
		return f;
	}

}
