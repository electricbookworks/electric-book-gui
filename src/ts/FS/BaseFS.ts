
/**
 * baseFS is a base for filesystems, but does not
 * itself implement the full FS interface.
 */ 
export abstract class BaseFS {
	protected _name: string;
	/** name is the name of the filesystem. */
    constructor(name: string) {
        this._name = name;
    }
    protected fileKey(path:string): string {
        return `${this._name}/${path}`;
    }
    Name() : string {
        return this._name;
    }

    abstract Read(path:string):Promise<string|undefined>;
    abstract Write(path:string,content:string):Promise<void>;
    abstract Remove(path:string):Promise<void>;
    Rename(fromPath:string, toPath: string):Promise<void> {
    	if (fromPath==toPath) {
    		return Promise.resolve();
    	}
    	return new Promise<void>( (resolve,reject)=>{
    		this.Exists(toPath).then(
    			(exist)=>{
    				if (exist) {
    					reject(new Error(`${toPath} already exists`));
    					return;
    				}
	    			return this.Exists(fromPath);
    			}
    		).then(
    			(exist)=>{
    				if (!exist) {
    					reject(new Error(`${fromPath} does not exist`));
    				}
    				return this.Read(fromPath);
    			})
    		.then(
    			(content)=>{
    				return this.Write(toPath, content);
    			})
    		.then(
    			()=>{
    				return this.Remove(fromPath);
    			})
    		.then(resolve)
    		.catch(
    			(err:Error)=>{
    				reject(new Error(`ERROR encountered on Rename(${fromPath}, ${toPath}) : ` + err.message));
    			}
    		);
    	});
    }
}
