export class FileStatus {
	constructor(protected status:string) {
	}
	Status() : string {
		if (this.status) {
			return this.status;
		}
		return 'undefined';
	}
}