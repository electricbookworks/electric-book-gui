import {API} from './API';
// import {Directory} from './Directory';
import {EBW} from './EBW';
import {EditorEvents, EditorEvent, RepoFileEditorCM} from './RepoFileEditorCM2';
import {FSFileList_File} from './FSFileList_File';

import {Node,NodeType} from './Tree/Node';
import {FileSystemView} from './Tree/FileSystemView2';
import {NotifyFS} from './FS2/NotifyFS';
import {File} from './FS2/File';
import {FileState} from './FS2/FileState';

import {Context} from './Context';

/**
 * FileSystemConnector links a view of the FileSystem as implemented
 * by a Tree/FileSystemView2 with the RepoFileEditorCM, ensuring that
 * when a `ebw-file-clicked` event is received from the FileSystemView,
 * the editor begins editing the file. Likewise, any events it the
 * FS filesystem will be reported to the FileSystemView.
 */
export class FileSystemConnector {
	protected api: API;
	protected View : FileSystemView;
	protected root: Node;

	protected loadingFile: string;

	constructor(
		protected context:Context,
		protected parent:HTMLElement,
		protected editor: RepoFileEditorCM,
		protected FS:NotifyFS,
		protected ignoreFunction: (name:string)=>boolean,
		protected filesJson: object,
		protected root: Node,
		filesAndHashes:Array<Array<string>>)
	{
		this.api = EBW.API();
		this.FS.Listeners.add(this.FSEvent, this);			
		this.View = new FileSystemView(
			this.context, this.root, parent, this.ignoreFunction, 
			this.FS);

		parent.addEventListener(`ebw-file-clicked`, (evt)=>{
			let path = evt.detail as string;
			this.loadingFile = path;
			this.FS.Read(path)
			.then(
				(f:File)=>{
					if (this.loadingFile!=f.Name()) {
						//console.log(`caught out-of-sync file read for : ${f.Name()}`);
						return;
					}
					this.editor.setFile(f);
				})
			.catch( EBW.Error );
		});
		this.View.prepopulate(filesAndHashes.map( ([p,h]:[string,string])=>p ));
		this.editor.Listeners.add(this.EditorEvent, this);
	}

	EditorEvent(evt:EditorEvent) {		
		let f = evt.File();
		if (!f) return;
		let v = this.root.FindOrCreateFileNode(f.Name());
		if (!v) {
			console.error(`FileSystemConnector.EditorEvent: Failed to find a NodeView for file `, f.Name());
			return;
		}
		let editing :boolean = true;
		switch (evt.Event()) {
			case EditorEvents.Saved:
			case EditorEvents.Changed:
			case EditorEvents.Loaded:
				editing = true;
				break;
			case EditorEvents.Unloaded:
				editing = false;
				break;
		}
		this.View.apply(f.Name(), (v)=>v.notifyEditing(editing));
	}

	FSEvent(f:File) {
		if (undefined==f) {
			debugger;
		}
		// console.log(`FileSystemConnector.FSEvent, f=`, f);
		switch (f.state) {
			case FileState.New:
				//	fallthrough
			case FileState.Unchanged:
				// fallthrough
			case FileState.Changed:
				this.root.FindOrCreateFileNode(f.path);
				break;
			case FileState.Deleted:
				// Nothing to do - deletion is a CSS issue
				break;
			case FileState.NotExist:
				break;
		}
	}
}
