import {BaseFS} from './BaseFS';

export class SessionFS extends BaseFS {
	constructor(name:string) {
		super(`session:${name}`);
	}
    Read(path:string):Promise<string|undefined> {
		let c : string|null = sessionStorage.getItem(this.fileKey(path));
		if (c) {
			return Promise.resolve(c);
		}
		return Promise.resolve(undefined);
    }
    Write(path:string,content:string):Promise<void> {
    	sessionStorage.setItem(this.fileKey(path), content);
    	return Promise.resolve();
    }
    Remove(path:string):Promise<void> {
    	sessionStorage.removeItem(this.fileKey(path));
    	return Promise.resolve();
    }
}
