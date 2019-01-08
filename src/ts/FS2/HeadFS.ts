import {File} from './File';
import {FS,FSImpl} from './FS';

export class HeadFS extends FSImpl {
	constructor(parent: FS) {
		super(parent);
	}
	Name():string => "head";
	Read(path:string):Promise<File|undefined> {
		// For Head FS we won't read the actual file data, just the 
		// Hash
		return Promise<File>.reject(`HeadFS.Read not yet implemented`);
	}
	Write(path:string, data:string):Promise<File> {
		return Promise<File>.reject(`Cannot Write to HEAD - just commit`)
	}
	Remove(path:string):Promise<File> {
		return Promise<File>.reject(`Cannot Remove from HEAD - just commit`)
	}
	Sync(path:string):Promise<File> {
		return Promise<File>.reject(`Cannot Sync to HEAD - just commit`)
	}
}



