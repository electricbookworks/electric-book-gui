import {Directory} from './Directory';
import {FS, FileStat, FileContent} from './FS';

// FSPrimeFromJS adds files to the FileSystem from the 
// Directory and File objects serialized in the given js object.
// The FileSystem must be able to accomodate empty content
// Writes.
export function FSPrimeFromJS(fs:FS, js:any):void {
	let d = Directory.FromJS(undefined, js);
	let filter = function(n:string):boolean {
		if ("."==n.substr(0,1)) {
			return false;
		}
		if ("_output" == n.substr(0,7)) {
			return false;
		}
		if ("_html"==n.substr(0,5)) {
			return false;
		}
		return true;
	}
	for (let f of d.FileNamesOnly(filter)) {
		fs.Write(f, FileStat.Exists);
	}
}
