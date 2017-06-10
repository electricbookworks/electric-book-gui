import {Context} from './Context';
import {EBW} from './EBW';
import {File} from './conflict/File';
import {FileList} from './conflict/FileList';
import {FileListDisplayEvent, FileListDisplay} from './conflict/FileListDisplay';

// RepoConflictPage handles conflict-merging for the repo.
// It's main data is generated in public/repo_conflict.html
export class RepoConflictPage {
	constructor(protected context:Context) {
		let fileList = new FileList(context);
		let fileListDisplay = new FileListDisplay(context, document.getElementById(`staged-files-list`), fileList);
		fileListDisplay.Listen.add(this.fileListEvent, this);
		fileListDisplay.el.addEventListener(`file-click`, (evt:CustomEvent)=> {
			this.fileListEvent(undefined, evt.detail.file);
		});

		let filesEl = document.getElementById('staged-files-data');
		if (!filesEl) {
			EBW.Error(`FAILED TO FIND #staged-files-data: cannot instantiate RepoConflictPage`);
			return;
		}
		let listjs = filesEl.innerText;
		console.log(`listjs = `, listjs);
		fileList.load(JSON.parse(listjs));
	}
	fileListEvent(e:FileListDisplayEvent, f:File) : void {
		console.log(`FileListEvent in RepoConflictPage: `, f);
	}
}