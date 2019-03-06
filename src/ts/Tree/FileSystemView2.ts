import {Tree_NodeView as NodeViewTemplate} from '../Templates';
import {NodeType, Node} from './Node';
import {Context} from '../Context';

import {File} from '../FS2/File';
import {FileState, FileStateString, SetFileStateCSS} from '../FS2/FileState';
import {FS} from '../FS2/FS';
import {NotifyFS} from '../FS2/NotifyFS';
import {Styler} from './Styler';

/**
 * FileSystemView displays a FileSystem, with each node either a Directory or a 
 * FileView itself.
 * When a file is clicked, an `ebw-file-clicked` event will be dispatched from the 
 * parent element.
 */
export class FileSystemView {
	protected api : API;
	protected views: Map<string,NodeView>;

	constructor(
		protected context:Context, 
		protected root: Node, 
		protected parent:HTMLElement,
		protected ignoreFunction: (name:string)=>boolean,
		protected notifyFS: NotifyFS|null,
		protected styler:Styler|null) 
	{
		this.views = new Map<string,NodeView>();
		this.root.added.add(this.nodeAdded, this);
		if (this.notifyFS) {
			this.notifyFS.Listeners.add(this.notifyFileChange, this);
		}
	}

	nodeAdded(n:Node) : void {		
		new NodeView(this, n, this.parent, this.ignoreFunction, this.styler);
	}

	prepopulate(paths:Array<string>):void {
		paths.sort();
		for (let p of paths) {
			this.root.FindOrCreateFileNode(p);
		}
	}

	notifyFileChange(f:File):void {
		let view = this.views[f.path];
		if (view) {
			view.notifyFileChange(this.notifyFS, f);
		}
	}

	apply(path:string, f:(nv:NodeView)=>void) {
		let v = this.views[path];
		if (v) f(v);
	}

	mapView(n:NodeView):void {
		this.views[n.path()] = n;
	}

	keyForNode(n:Node) : string {
		return this.context.RepoOwner + ":" + this.context.RepoName + ":" + n.path() 
			+ `.fsv.closed`;
	}
	isClosed(node:Node) : boolean {
		let v = window.localStorage.getItem(this.keyForNode(node));
		return null==v;
	}
	setClosed(node:Node, closed: boolean) : void {
		let key  = this.keyForNode(node);
		if (closed) {
			window.localStorage.removeItem(key);
		} else {
			window.localStorage.setItem(key, `t`);
		}		
	}
}

class NodeView extends NodeViewTemplate{
	constructor(protected FSV: FileSystemView, protected node: Node, 
		protected parent:HTMLElement, protected ignoreFunction: (name:string)=>boolean, 
		protected styler:(n:Node,el:HTMLElement)=>undefined|null) {
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
				this.el.dispatchEvent(new CustomEvent(`ebw-file-clicked`,
				{
					bubbles: true,
					cancelable: true,
					detail: this.path(),
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

		if (this.styler) {
			this.styler(this.node, this.el);
		}
	}
	childAdded(n:Node) : void {
		new NodeView(this.FSV, n, this.$.children, this.ignoreFunction, this.styler);
	}
	notifyFileChange(fs:FS, f:File) : void {
		f.SetStateCSS(this.el);
	}
	notifyEditing(b:boolean):void {
		this.el.classList.remove(`editing-in-progress`);
		if (b) {
			this.el.classList.add(`editing-in-progress`);
		}
	}
	path() : string {
		return this.node.path();
	}
}