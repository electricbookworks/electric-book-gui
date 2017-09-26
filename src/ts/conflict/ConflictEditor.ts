import {FileContent, FileEvent, File} from './File';

export interface ConflictEditor {
	WorkingSide():string;
	TheirSide():string;
	getWorkingText():string;
	setWorkingText(s:string):void;
	isWorkingDeleted() : boolean ;
	SaveFile() : Promise<string> ;
	FileEventListener(source:any, e:FileEvent, fc:FileContent):void;
	// Merge starts merging a file.
	Merge(file:File) : void;
}