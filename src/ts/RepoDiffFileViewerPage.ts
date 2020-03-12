import {Context} from 'Context';
import {Node, NodeType} from './Tree/Node';
import {FileSystemView} from './Tree/FileSystemView2';


export class RepoDiffFileViewerPage {
	protected styler: Styler;
	constructor(protected context:Context, protected parent: HTMLElement, protected data) {
		this.root = new Node(null, ``, NodeType.DIR, null);
		this.fileMap = new Map();
		this.data.diffs.forEach(d=>{
			this.fileMap.set("/" + d.Path, d);
		});
		this.styler = (n:Node, el:HTMLElement)=>{
			let f = n.path();
			let diff = this.fileMap.get(f);
			if (diff) {
				el.classList.add(diff.State);
			}
		}

		this.fsv = new FileSystemView(
			context,
			this.root,
			this.parent,
			this.data.ignoreFilter,
			null,	// no NotifyFS
			this.styler);
		this.fsv.prepopulate(this.data.diffs.map(i=>i.Path));

		this.parent.addEventListener(`ebw-file-clicked`, (evt)=>{
			let diff = this.fileMap.get(evt.detail);
			if (!diff) {
				console.error(`CLICKED FILE ${evt.detail} BUT FAILED TO FIND DIFF`);
				return;
			}
			let src = 
				`/repo/${this.context.RepoOwner}/${this.context.RepoName}/${diff.URL}`;
			document.getElementById(`diff-view`).src = src;
			document.getElementById(`diff-view`).classList.add('file-loaded');
		});
	}
}