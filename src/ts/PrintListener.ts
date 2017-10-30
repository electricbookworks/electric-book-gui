import {EBW} from './EBW';
import {FileListDialog, FileListDialogResult} from './FileListDialog';
import EventSource = require('./sse');
import {PrintListenerTerminal} from './PrintListenerTerminal';

export class PrintListener {
	protected listDialog: FileListDialog;

	constructor(protected repoOwner:string, 
		protected repoName:string, 
		protected book:string=`book`,
		protected format:string=`print`) {
		this.listDialog = new FileListDialog();

		if (``==this.book) {
			this.book = `book`;
		}
		if ((`print`!=format) && (`screen`!=format)) {
			EBW.Error(`PrintListener format parameter must be either 'print' or 'screen'`);
			return;
		}
		EBW.API().FindFileLists(repoOwner, repoName).then(
			([files]:[string[]])=>{
				// console.log(`Files directories are `, files);
				// debugger;
				// files.push(files[0]);
				if (2>files.length) {
					return Promise.resolve<string>(0==files.length ? `` : files[0]);
				}
				return this.listDialog.Open(files)
					.then(
						(res:FileListDialogResult)=>{
							if (res.Cancelled) {
								return Promise.resolve<string>(undefined);
							} else {
								return Promise.resolve<string>(res.FileList);
							}
						});
			}).then(
			(filedir?:string)=>{
				if ('undefined'==typeof filedir) {
					return Promise.resolve<[any]>([undefined]);
				}
				return EBW.API().PrintPdfEndpoint(repoOwner, repoName, book, format, filedir);
			}).then(
			([url]:[string])=>{
				if ('undefined'==typeof url) {
					return;
				}
				this.startListener(url);
			}).catch( EBW.Error );
	}
	startListener(key:string) {
		let terminal = new PrintListenerTerminal();

		let url = document.location.protocol +
				 "//" +
				 document.location.host + "/print/sse/" + key;
		let sse = new EventSource(url);
		sse.addEventListener(`open`, function() {
		});
		sse.addEventListener('tick', function(e:any) {
			terminal.ticktock();
		});
		sse.addEventListener(`info`, function(e:any) {
			// console.log(`INFO on printListener: `, e.data);
			let data = JSON.parse(e.data);
			terminal.addLine(data.log);
		});
		sse.addEventListener(`log`, function(e:any) {
			let data = JSON.parse(e.data);
			terminal.addLine(data.log);
		})
		sse.addEventListener(`error`, function(e:any) {
			let err = JSON.parse(e.data);
			EBW.Error(err);
			sse.close();
			terminal.addError(err.log);
		});
		sse.addEventListener(`output`, (e:any)=> {
			let data = JSON.parse(e.data);
			let url = document.location.protocol +
				 "//" +
				 document.location.host + 
				 `/www/${this.repoOwner}/${this.repoName}/${data}`;
			EBW.Toast(`Your PDF is ready: opening in a new window.`);
			terminal.done(url);
			window.open(url, `${this.repoOwner}-${this.repoName}-pdf`);
		});
		sse.addEventListener(`done`, function(e:any) {
			sse.close();
		});
		sse.onmessage = (e:any)=>{
			this.onmessage(e);
		}
		sse.onerror = EBW.Error;

	}
	onmessage(e:any) {
		console.log(`PrintListener.onmessage: `, e);
	}
}
