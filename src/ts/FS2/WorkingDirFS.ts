import {File,WireFile} from './File';
import {FS, FSImpl} from './FS';

export class WorkingDirFS extends FSImpl {
	constructor(protected context:Context, parent: FS) {
		super(parent);
	}
	Name():string { return "working"; }
	Read(path:string):Promise<File|undefined>{
		return this.context.API()
		.ReadFileData(this.context.RepoOwner, this.context.RepoName, "our-wd", path)
		.then(
			([w]:[WireFile])=>{
				let f = File.FromWireFile(w);
				return this.setState(f)
			}
			);
	}
	Write(path:string, data:string):Promise<File> {
		return this.context.API()
		.WriteAndStageFile(this.context.RepoOwner, this.context.RepoName,
			path, data).then(
			([w]:[WireFile])=>this.setState(File.FromWireFile(w))
			);
	}
	Remove(path:string):Promise<File> {
		return this.context.API()
		.RemoveAndStageFile(this.context.RepoOwner, this.context.RepoName, path)
		.then(
			()=>this.setState(new File(path, false))
			);
	}
	Sync(path:String):Promise<File>{
		// Sync'ing a WorkingDir is adding to the Index
		return this.context.API()
		.StageFile(this.context.RepoOwner, this.context.RepoName, path)
		.then(
			()=>this.Read(path)
			);
	}
	Revert(path:String):Promise<File>{
		return this.context.API()
		.RevertFile(this.context.RepoOwner, this.context.RepoName, path)
		.then(
			([w]:[WireFile])=>setState(File.FromWireFile(w))
		);
	}
}
