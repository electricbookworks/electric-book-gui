import {FSFileTree_Dir as Template} from './Templates';

interface FileType {
	name: string;
	parent: FileType;
	dir: boolean;
}

class Dir {
	protected parent: Dir;
}
export class FSFileTree_Dir extends Template {
	constructor(
		protected parent:any
		) {

	}
}