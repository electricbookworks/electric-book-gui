class PrintListener {
	constructor(repoOwner, repoName, book=`book`) {
		this.repoOwner = repoOwner;
		this.repoName = repoName;
		if (``==book) {
			book = `book`;
		}
		this.book = book;
		EBW.API().PrintPdfEndpoint(repoOwner, repoName, book).then(
			(args)=>{
				this.startListener(args[0]);
			})
		.catch( EBW.Error );
	}
	startListener(key) {
		let url = document.location.protocol +
				 "//" +
				 document.location.host + "/print/sse/" + key;
		let sse = new EventSource(url);
		sse.addEventListener(`open`, function() {
		});
		sse.addEventListener('tick', function(e) {
			// console.log(`tick received: `, e);
		});
		sse.addEventListener(`info`, function(e) {
			// console.log(`INFO on printListener: `, e.data);
			let data = JSON.parse(e.data);
			Toast.Show(`Printing: `, data);
		});
		sse.addEventListener(`error`, function(e) {
			let err = JSON.parse(e.data);
			EBW.Error(err);
			sse.close();
		});
		sse.addEventListener(`output`, e=> {
			let data = JSON.parse(e.data);
			let url = document.location.protocol +
				 "//" +
				 document.location.host + 
				 `/www/${this.repoOwner}/${this.repoName}/${data}`;
			Toast.Show(`Your PDF is ready: opening in a new window.`);
			window.open(url, `${this.repoOwner}-${this.repoName}-pdf`);
		});
		sse.addEventListener(`done`, function(e) {
			sse.close();
		});
		sse.onmessage = (e)=>{
			this.onmessage(e);
		}
		sse.onerror = EBW.Error;

	}
	onmessage(e) {
		console.log(`PrintListener.onmessage: `, e);
	}
}

window.PrintListener = PrintListener;
