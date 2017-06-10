import {RepoConflictFileModel} from './RepoConflictFileModel';

import signals = require('signals');

export class RepoConflictFilesListModel {
	protected files: Array<RepoConflictFileModel>;
	constructor() {
		this.files = [];
	}
	addFile(state:string, name:string) {
		this.files.push(new RepoConflictFileModel(status, name));
	}

}