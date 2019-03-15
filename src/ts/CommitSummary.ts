export class CommitSummary {
	constructor(protected when: string , protected oid: string, protected message: string) {
	}
	When() : string {
		return this.when;
	}
	Message() : string {
		return this.message;
	}
	OID() : string {
		return this.oid;
	}
}