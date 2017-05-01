    Exists(path:string):Promise<boolean> {
    	return new Promise( (resolve,reject)=>{
    		return this.Read(path);
    	}).then(
    		(c)=>{
    			if (undefined==c) {
    				resolve(false);
    				return;
    			}
    			resolve(true);
    		})
    	.catch( reject );
    }

    List(regexp?:string):Promise<string[]> {
        let reg = new RegExp(regexp);
        return new Promise<string[]>( (resolve,reject)=>{
            this.ListAll()
            .then( 
                (files)=>{
                    resolve( files.filter(reg.test, reg) );            
                })
            .catch(reject);
        }));
    }
    abstract ListAll():Promise<string[]>;



--- from SessionFS

    ListAll():Promise<string[]> {
        let files : string[] = [];
        let filesLen = sessionStorage.length;
        for (let i = 0; i<filesLen; i++) {
            files.push(sessionStorage.key(i));
        }
        return Promise.resolve(files);
    }