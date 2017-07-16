import signals = require('signals');

export class RepoConflictFileModel {
	constructor(protected status:string, protected name: string) {
	}
}