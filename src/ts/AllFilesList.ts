import {API} from './API';
// import {Directory} from './Directory';
import {EBW} from './EBW';
import {RepoFileEditorCM} from './RepoFileEditorCM';
import {Volume} from './FS/Volume';
import {FileInfo} from './FS/FileInfo';
import {FileState} from './FS/FileState';
import {AllFiles_File} from './AllFiles_File';
import {RepoFileModel} from './RepoFileModel';
import {RepoFileModelOptions} from './RepoFileModelOptions';
import {RepoFileModelCache} from './RepoFileModelCache';

export class AllFilesList {
	protected api: API;
	protected files: Map<string, AllFiles_File>;
	constructor(
		protected parent:HTMLElement,
		protected repoOwner:string, 
		protected repoName:string,
		protected volume:Volume,
		protected editor: RepoFileEditorCM,
		protected fileCache: RepoFileModelCache) {
		this.api = EBW.API();
		if (``==this.repoOwner) {
			this.repoOwner = parent.getAttribute(`repo-owner`);
		}
		if (``==this.repoName) {
			this.repoName = parent.getAttribute(`repo-name`);
		}
		this.volume.Events.add(this.volumeChange, this);
		this.files = new Map<string,AllFiles_File>();
	}
	volumeChange(volume: Volume, fileInfo: FileInfo) {
		console.log(`volumeChange -- fileInfo = `, fileInfo);
		// If fileInfo==FileState.Exists,
		// we check whether we already have this element,
		// otherwise we need to add it to our list.
		// If fileInfo==FileState.Changed, we also check
		// whether we have the element, since Changed can
		// mark a creation.
		// For Purged, the AllFiles_File will handle the
		// state change itself, but we need to remove the
		// element from our tracking list. 
		let f : AllFiles_File = this.files.get(fileInfo.Name());
		// We only
		switch (fileInfo.State()) {
			case FileState.Exists:
				if (!f) {
					this.newFile(fileInfo);
				}
				break;
			case FileState.Changed:
				if (!f) {
					this.newFile(fileInfo);
				}
				break;
			case FileState.Deleted:
				break;
			case FileState.NotExist:
				if (f) {
					this.files.delete(fileInfo.Name());
				}
				break;
		}
	}
	newFile(fileInfo:FileInfo) : AllFiles_File {
		let f = new AllFiles_File(this.parent, fileInfo, {
			clickName: (evt:any)=>{
				console.log(`clicked ${fileInfo.Name()}`);
				let m = this.fileCache.Create(fileInfo);
				this.editor.setFile(m);
			}
		});
		this.files.set(fileInfo.Name(), f);
		return f;
	}

}
