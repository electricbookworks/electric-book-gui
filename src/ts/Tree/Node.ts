import {Signal} from '../Signal';

export enum NodeType {
	FILE = 1,
	DIR = 2,
}

// Node is a generic node in a tree. It might be a leaf, it might not.
export class Node {	
	public children: Array<Node>;

	public changed: Signal;
	public removed: Signal;
	public added: Signal;

	constructor(public parent:Node|null, public name:string, public nodeType: NodeType, public data:any) {
		this.changed = new Signal();
		this.removed = new Signal();
		this.added = new Signal();

		this.children = new Array<Node>();
	}
	depth(): int {
		if (null==this.parent) {
			return 0;
		}
		return 1+this.parent.depth();
	}
	canCollapse() : boolean {
		return (this.nodeType == NodeType.DIR);
	}
	child(name: string): Node|undefined {
		for (let c of this.children) {
			if (c.name==name) {
				return c
			}
		}
		return undefined;
	}
	parents(): Array<Node> {
		if (null==this.parent) {
			// The root Node is a placeholder, and returns as a non-existent node
			let a : Array<Node> = [];
			return a;
		}
		let a = this.parent.parents();
		a.push(this);
		return a;
	}
	path(): string {
		return '/' + this.parents().map( (n)=>n.name ).join(`/`);
	}

	/**
	 * root returns the root node of the tree in which this node is located
	 */
	root() : Node {
		if (this.parent) {
			return this.parent.root();
		}
		return this;
	}
	add(n:Node):void {
		// TODO: SORT CHILDREN
		this.children.push(n);
		n.parent = this;
		// TODO: Notify listeners of the new child - NODE_ADDED
		this.added.dispatch(n);
	}
	/**
	 * find returns the Node for the given path from the root of
	 * this Node's filesystem.
	 */
	find(path:string) : Node|undefined {
		return this.root().recurse_path(Node.path_array(path), undefined);
	}

	remove():void {
		let i = this.parent.children.indexOf(this);
		if (-1==i) {
			console.error(`failed to find Node ${this.name} in list of parent's children`);
			return;
		}
		this.parent.children.splice(i,1);
		this.removed.dispatch(this);
	}

	change(): void {
		this.changed.dispatch(this);
	}

	NodeFromPath(path: string): Node|undefined {
		return this.root().recurse_path(Node.path_array(path), null);
	};

	FindOrCreateFileNode(path: string, data: any=undefined) : Node|undefined {
		return this.root().recurse_path(Node.path_array(path),
			function (path:Array<string>,parent:Node) : Node|undefined {
				let nt:NodeType = NodeType.FILE;
				if (1<path.length) {
					nt = NodeType.DIR;
				}
				let n = new Node(parent, path[0], nt, data);
				parent.add(n);	// @TODO : SHOULD REALLY SORT FILES AS THEY ARE ADDED TO THE FileSystem in FileSystem.ts
				return n;
			});
	}
	FindFileNode(path:string) : Node|undefined {
		return this.root().recurse_path(Node.path_array(path));
	}

	static path_array(path:string) : Array<string> {
		let p = path.split("/");
		if (``==p[0]) {
			p = p.slice(1);
		}
		return p;
	}


	recurse_path(
		path: Array<string>, 
		handler:(
			path:Array<string>, 
			parent:Node)=>Node|undefined)
		: Node|undefined 
	{
		let c = this.child(path[0]);
		if (undefined==c && handler) {
			c = handler(path, this);
		}
		if (undefined==c || path.length==1) {
			return c
		}
		return c.recurse_path(path.slice(1), handler);
	}

	walkFiles(handle:(path:string)=>undefined):undefined {
		if (this.nodeType==NodeType.FILE) {
			handle(this.path());
		}
		for (let c of this.children) {
			c.walkFiles(handle);
		}
	}
	files() : Array<string> {
		let a = [];
		this.walkFiles((p)=>a.push(p));
		return a;
	}
}