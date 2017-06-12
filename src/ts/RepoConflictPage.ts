import {Context} from './Context';
import {ControlTag} from './ControlTag';
import {EBW} from './EBW';
import {File} from './conflict/File';
import {FileList} from './conflict/FileList';
import {FileListDisplayEvent, FileListDisplay} from './conflict/FileListDisplay';
import {MergeEditor} from './conflict/MergeEditor';
import {MergeInstructions} from './conflict/MergeInstructions';
import {CommitMessageDialogResult, CommitMessageDialog} from './CommitMessageDialog';

// RepoConflictPage handles conflict-merging for the repo.
// It's main data is generated in public/repo_conflict.html
export class RepoConflictPage {
	protected editor: MergeEditor;
	protected commitDialog: CommitMessageDialog;

	constructor(protected context:Context) {
		let fileList = new FileList(context);
		let fileListDisplay = new FileListDisplay(context, document.getElementById(`staged-files-list`), fileList);

		fileListDisplay.el.addEventListener(`file-click`, (evt:CustomEvent)=> {
			this.fileListEvent(undefined, evt.detail.file);
		});

		this.editor = new MergeEditor(context, document.getElementById(`editor-work`));
		this.commitDialog = new CommitMessageDialog(false);
		new MergeInstructions(document.getElementById('merge-instructions'), this.editor);


		new ControlTag(document.getElementById(`files-show-tag`),
			(showing:boolean)=>{
				let el = document.getElementById(`files`);				
				el
				.style.width = showing ? "30em":"0px";
			});


		let filesEl = document.getElementById('staged-files-data');
		if (!filesEl) {
			EBW.Error(`FAILED TO FIND #staged-files-data: cannot instantiate RepoConflictPage`);
			return;
		}
		let listjs = filesEl.innerText;
		fileList.load(JSON.parse(listjs));

		document.getElementById(`action-commit`).addEventListener(`click`, (evt)=>{
			evt.preventDefault(); evt.stopPropagation();
			this.commitDialog.Open(`Resolve Conflict`, `The merge will be resolved.`)
			.then(
				(r:CommitMessageDialogResult) => {
					if (r.Cancelled) {
						console.log(`Cancelled commit`);
						return;
					}
					document.location.href = `/repo/` +
						encodeURIComponent(this.context.RepoOwner) + 
						`/` + encodeURIComponent(this.context.RepoName) +
						`/conflict/resolve?` +
						`message=` + encodeURIComponent(r.Message) + 
						`&notes=` + encodeURIComponent(r.Notes);
					return;
				})
			.catch (EBW.Error);
		});
	}
	fileListEvent(e:FileListDisplayEvent, f:File) : void {
		console.log(`FileListEvent in RepoConflictPage: `, f);
		this.editor.Merge(f);
	}
}