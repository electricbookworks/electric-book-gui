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
		this.State = s;
		this.Listener.despatch(this);
	}

	State(): FileState {
		return this.state;
	}

	Name() : string {
		return this.name;
	}
};
