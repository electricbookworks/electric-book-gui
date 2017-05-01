import {AllFilesEditor} from './AllFilesEditor';
import {API} from './API';
// import {Directory} from './Directory';
import {EBW} from './EBW';
import {RepoFileEditorCM} from './RepoFileEditorCM';
import {Volume} from './FS/Volume';
import {FileInfo} from './FS/FileInfo';
import {AllFiles_File} from './AllFiles_File';
import {RepoFileModel} from './RepoFileModel';

export class AllFilesList {
	protected api: API;
	constructor(
		protected parent:HTMLElement,
		protected repoOwner:string, 
		protected repoName:string,
		protected editor: RepoFileEditorCM) {
		this.api = EBW.API();
		if (``==this.repoOwner) {
			this.repoOwner = parent.getAttribute(`repo-owner`);
		}
		if (``==this.repoName) {
			this.repoName = parent.getAttribute(`repo-name`);
		}
		if (parent.hasAttribute(`data-files`)) {
			this.renderFilesList(JSON.parse(parent.getAttribute(`data-files`)));
		} else {
			this.api.ListAllRepoFiles(this.repoOwner, this.repoName)
			.then( ([js])=>{
				this.renderFilesList(js);
			})
			.catch( EBW.Error );
		}
	}
	renderFilesList(js) {
		let v = new Volume();
		v.Events.add(this.volumeChange, this);
		v.FromJS(js);
		// new AllFilesEditor(
		// 	this.repoOwner, this.repoName,
		// 	document.getElementById(`all-files-editor`),
		// 	d, 
		// 	(_source, file)=>{
		// 		this.editor.setFile(file);
		// });
	}
	volumeChange(volume: Volume, fileInfo: FileInfo) {
		new AllFiles_File(this.parent, fileInfo, {
			clickName: (evt)=>{
				console.log(`clicked ${fileInfo.Name()}`);
				let m = new RepoFileModel(this.repoOwner,
					this.repoName, fileInfo.Name());
				this.editor.setFile(m);
			}
		});
	}
}
