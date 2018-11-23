import {Tree_NodeView as NodeViewTemplate} from '../Templates';
import {FileSystem} from './FileSystem';
import {NodeType, Node} from './Node';
import {Context} from '../Context';
import {FileContent, SetFileStatCSS} from '../FS/FS';
import {FSNotify} from '../FS/FSNotify';

export class FileSystemView {
	protected files: object;

	constructor(protected context:Context, protected FS: FileSystem, protected parent:HTMLElement,
		protected ignoreFunction: (name:string)=>boolean,
		notifier: FSNotify) {
		this.files = new Map<string,NodeView>();
		this.FS.root.added.add(this.nodeAdded, this);
		notifier.Listeners.add(this.notifyFileChange, this);
	}
	nodeAdded(n:Node) : void {		
		new NodeView(this, n, this.parent, this.ignoreFunction);
	}
	closedKeyForNode(n:Node) : string {
		return this.context.RepoOwner + ":" + this.context.RepoName + ":" + this.FS.PathFromNode(n) 
			+ `.fsv.closed`;
	}
	isClosed(node:Node) : boolean {
		let v = window.localStorage.getItem(this.closedKeyForNode(node));
		return `t`==v;
	}
	setClosed(node:Node, closed: boolean) : void {
		let key  = this.closedKeyForNode(node);
		if (closed) {
			window.localStorage.setItem(key, `t`);
		} else {
			window.localStorage.removeItem(key);
		}		
	}
	notifyFileChange(path:string, fc:FileContent):void {
		console.log(`FileSystemView.notifyFileChanged(path=${path})`);
		let node = this.files[path];
		if (node) {
			node.notifyFileChange(fc);
		}
	}
	mapView(n:Node):void {
		this.files[n.path()] = n;
	}
}

class NodeView extends NodeViewTemplate{
	constructor(protected FSV: FileSystemView, protected node: Node, 
		protected parent:HTMLElement, protected ignoreFunction: (name:string)=>boolean) {
		super();
		this.$.name.innerText = this.node.name;
		if (node.canCollapse()) {
			this.$.close.addEventListener(`click`, (evt)=>{
				evt.preventDefault(); evt.stopPropagation();
				let c = this.$.children;				
				this.el.classList.toggle(`closed`);
				this.FSV.setClosed(this.node, this.el.classList.contains(`closed`));
			});
			this.el.classList.add(`node-dir`);
		} else {
			this.el.classList.add(`node-file`);
			this.el.addEventListener(`click`, (evt)=>{
				evt.preventDefault(); evt.stopPropagation();
				this.el.dispatchEvent(new CustomEvent(`ebw-FileClicked`,
				{
					bubbles: true,
					cancelable: true,
					detail: this.node,
				}));
			});
		}
		if (FSV.isClosed(node)) {
			this.el.classList.add(`closed`);
		}
		if (this.ignoreFunction(this.node.name)) {
			this.el.classList.add(`ignore`);
		}
		this.node.added.add(this.childAdded, this);
		// this.el.style.marginLeft = (0.4*node.depth())+"em";
		parent.appendChild(this.el);

		this.FSV.mapView(this);
	}
	childAdded(n:Node) : void {
		new NodeView(this.FSV, n, this.$.children, this.ignoreFunction);
	}
	notifyFileChange(fc:FileContent) : void {
		console.log(`notifyFileChange received in NodeView for `, this.node.path());
		SetFileStatCSS(this.el, fc.Stat);
	}
	path() : string {
		return this.node.path();
	}
}