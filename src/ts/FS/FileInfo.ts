import {FileState} from './FileState';

import signals = require('signals');

export class FileInfo {
	protected name: string;
	protected state:FileState;
	Listener: signals.Signal;

	constructor(name:string, state:FileState) {
		this.name = name;
		this.state = state;
		this.Listener = new signals.Signal();
	}

	SetState(s:FileState) {
		console.log(`SetState ${this.name} = `, s);
		this.state = s;
		this.Listener.dispatch(this);
	}

	State(): FileState {
		return this.state;
	}

	// Name returns the full pathed name of the file.
	Name() : string {
		return this.name;
	}
};
