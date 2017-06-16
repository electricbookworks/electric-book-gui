export class FileStatus {
	constructor(protected status:string) {
	}
	Status() : string {
		if (this.status) {
			return this.status;
		}
		return 'undefined';
	}
	SetStatus(s:string) {
		this.status = s;
	}
}