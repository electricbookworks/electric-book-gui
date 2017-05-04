export interface FileContentInterface {
	Exists(path:string): Promise<boolean>;
	Read(path:string):Promise<string>;

	Write(path:string, content: string): Promise<void>;
	Remove(path:string) : Promise<void>;
	Rename(fromPath:string, toPath:string) : Promise<void>;
}