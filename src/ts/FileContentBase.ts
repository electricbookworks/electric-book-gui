export class FileContentBase {
	constructor(
		protected repoOwner:string, 
		protected repoName:string) 
	{}
	Rename(fromPath:string, toPath: string): Promise<void> {
		if (fromPath==toPath) {
			return Promise.resolve<void>();
		}
		let checkFrom = this.Exists(fromPath)
		.then(
			(exists)=>{
				if (!exists) {
					return Promise.reject(`${fromPath} does not exist`);
				}
				return Promise.resolve();
			});
		let checkTo = this.Exists(toPath)
		.then(
			(exists)=>{
				if (exists) {
					return Promise.reject(`${toPath} already exists`);
				}
				return Promise.resolve();
			}
		);
		return Promise.all(checkFrom, checkTo)
		.then(
			()=>{
				return this.Read(fromPath);
			})
		.then(
			(content)=>{
				return this.Write(toPath, content);
			})
		.then(
			()=>{
				return this.Remove(fromPath);
			});
	}
}