
import {ConflictEditor} from './conflict/ConflictEditor';
import {Context} from './Context';
import {ControlTag} from './ControlTag';
import {EBW} from './EBW';
import {File} from './conflict/File';
import {FileList} from './conflict/FileList';
import {FileListDisplayEvent, FileListDisplay} from './conflict/FileListDisplay';
import {MergeEditor} from './conflict/MergeEditor';
import {MergeInstructions} from './conflict/MergeInstructions';
import {CommitMessageDialogResult, CommitMessageDialog} from './CommitMessageDialog';
import {ClosePRDialog, ClosePRDialogResult} from './conflict/ClosePRDialog';
import {MergingInfo} from './conflict/MergingInfo';
import {SingleEditor} from './conflict/SingleEditor';

// RepoConflictPage handles conflict-merging for the repo.
// It's main data is generated in public/repo_conflict.html
export class RepoConflictPage {
	protected editor: ConflictEditor;
	protected commitDialog: CommitMessageDialog;
	protected closePRDialog: ClosePRDialog;
	protected mergingInfo: MergingInfo;

	constructor(protected context:Context) {
		this.mergingInfo = new MergingInfo(document.getElementById(`merging-info`));
		this.closePRDialog = new ClosePRDialog(false);

		let fileList = new FileList(context);
		let fileListDisplay = new FileListDisplay(context, document.getElementById(`staged-files-list`), fileList, this.mergingInfo);

		fileListDisplay.el.addEventListener(`file-click`, (evt:CustomEvent)=> {
			this.fileListEvent(undefined, evt.detail.file);
		});

		if (this.mergingInfo.IsPRMerge()) {
			this.editor = new MergeEditor(context, document.getElementById(`editor-work`));
			new MergeInstructions(document.getElementById('merge-instructions'), this.editor as MergeEditor);
		} else {
			let work = document.getElementById(`editor-work`);
			this.editor = new SingleEditor(context, work);
		}
		// items to be hidden in a PR merge or a not-pr-merge are controlled
		// by CSS visibility based on whether they have a .pr-merge or .not-pr-merge
		// class
		
		this.commitDialog = new CommitMessageDialog(false);

		new ControlTag(document.getElementById(`files-show-tag`),
			(showing:boolean)=>{
				let el = document.getElementById(`files`);
				if (showing)
					el.classList.add(`showing`);
				else
					el.classList.remove(`showing`);				
				// el
				// .style.width = showing ? "30em":"0px";
			});


		let filesEl = document.getElementById('staged-files-data');
		if (!filesEl) {
			EBW.Error(`FAILED TO FIND #staged-files-data: cannot instantiate RepoConflictPage`);
			return;
		}
		let listjs = filesEl.innerText;
		let fileListData = JSON.parse(listjs);
		fileList.load(fileListData);

		document.getElementById(`action-commit`).addEventListener(`click`, (evt)=>{
			evt.preventDefault(); evt.stopPropagation();
			console.log(`IN action-commit CLICK LISTENER`);
			EBW.API().IsRepoConflicted(this.context.RepoOwner, this.context.RepoName)
			.then(
				([conflicted]:[boolean])=>{
					if (conflicted) {
						EBW.Alert(`You need to resolve all file conflicts before you can resolve the merge.`);
						return Promise.resolve();
					}
					return this.commitDialog.Open(`Resolve Conflict`, `The merge will be resolved.`)
						.then(
							(r:CommitMessageDialogResult) => {
								if (r.Cancelled) {
									return;
								}
								console.log(`Result= `, r);
								this.context.RepoRedirect(`conflict/resolve`, 
									new Map([[`message`,r.Message],[`notes`,r.Notes]])
								);
								return;
							})

			})
			.catch (EBW.Error);
		});
		document.getElementById(`action-abort`).addEventListener(`click`, (evt)=>{
			evt.preventDefault(); evt.stopPropagation();
			if (this.mergingInfo.IsPRMerge()) {
				this.closePRDialog.Open(`Close submission`,
					`You have been merging submission ${this.mergingInfo.PRNumber}.
					Do you want to reject the submission permanently?`, 
					{Close: false, CloseMessage:"", Cancelled: false})
				.then(
					(r:ClosePRDialogResult)=>{
						if (r.Cancelled) {
							return;
						}
						this.context.RepoRedirect(`conflict/abort`, 
							new Map([[`message`,r.CloseMessage],
								[`close`,r.Close]])
						);
						return;
					})
				.catch( EBW.Error );
			} else {				
				this.context.RepoRedirect(`conflict/abort`);
			}
		})
	}
	fileListEvent(e:FileListDisplayEvent, f:File) : void {
		this.editor.Merge(f);
	}
}