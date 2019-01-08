import {File} from './File';
import {FS, FSImpl} from './FS';

import signals = require('signals');

/**
 * NotifyFS is transparent, but notifies listeners of any changes to 
 * a path.
 */
export class NotifyFS extends FSImpl {
	public Listeners: signals.Signal;
	constructor(protected parent:FS) {
		super(parent);
		this.Listeners = new signals.Signal();
	}
	notify(f:File) : Promise<File> {
		this.Listeners.dispatch(f);
		return Promise.resolve(f);
	}
	Name():string { return this.parent.Name(); }
	Read(path:string):Promise<File|undefined> {
		return this.parent.Read(path);
	}
	Write(path:string, data:string):Promise<File> {
		return this.parent.Write(path, data)
		.then( (f:File)=>this.notify(f) );
	}
	Remove(path:string):Promise<File> {
		return this.parent.Remove(path)
		.then( (f:File)=>this.notify(f) );
	}
	Sync(path:string):Promise<File> {
		return this.parent.Sync(path)
		.then( (f:File)=>this.notify(f) );
	}
	Revert(path:string):Promise<File> {
		return this.parent.Revert(path)
		.then( (f:File)=>this.notify(f) );
	}
	// Notify is a transparent FS, so the call to parent needs to actually
	// be the call to its parent's parent
	Parent(name=``):FS {
		return this.parent.Parent(name);
	}
}
