function serialize(content:string) : string {
	if (content) {
		return "1" + content;
	}
	return "0";
}

function deserialize(serialized:string) : string {
	if (!serialized) {
		return undefined;
	}
	if (0==serialized.length) {
		return undefined;
	}
	switch (serialized.substr(0,1)) {
		case "0":
			return undefined;
		case "1":
			return serialized.substr(1);
	}
	return undefined;
}

export class FileContentSession {
	protected key: string;
	constructor(
		protected name: string
		protected repoOwner:string, 
		protected repoName:string) 
	{
		this.key = encodeURIComponent(this.name) + `:` +
			encodeURIComponent(this.repoOwner) + `:` +
			encodeURIComponent(this.repoName) + `:`;
	}

	Exists(path:string) : Promise<boolean> {
		let c = sessionStorage.get(this.key + path);
		if (c) {
			return Promise.resolve<boolean>(true);
		}
		return Promise.resolve<boolean>(false);
	}

	Read(path:string) : Promise<string> {
		let c = sessionStorage.get(this.key + path);
		if (c) {
			return Promise.resolve<string>(deserialize(c));
		}
		return Promise.reject(`${path} does not exist`);
	}

	Write(path:string, content?: string): Promise<void> {
		sessionStorage.set(this.key + path, serialize(content));
		return Promise.resolve<void>();
	}

	Remove(path:string) : Promise<void> {
		sessionStorage.removeItem(this.key + path);
		return Promise.resolve<void>();
	}

	Rename(fromPath:string, toPath:string) : Promise<void> {
		let fromKey = this.key + fromPath;
		let toKey = this.key + toPath;
		let c = sessionStorage.get(fromKey);
		if (!c) {
			return Promise.reject(`${fromPath} does not exist`);
		}
		if (sessionStorage.get(toKey)) {
			return Promise.reject(`${toPath} already exists`);
		}
		sessionStorage.setItem(toKey, c);
		sessionStorage.removeItem(fromKey);
		return Promise.resolve<void>();
	}
}