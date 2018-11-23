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
		// if (null!=parent) {
		// 	this.changed.add( (...paramsArr: any[])=>parent.changed.dispatch(this.arguments) );
		// }
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
		return this.parents().map( (n)=>n.name ).join(`/`);
	}
	add(n:Node):void {
		// TODO: SORT CHILDREN
		this.children.push(n);
		n.parent = this;
		// TODO: Notify listeners of the new child - NODE_ADDED
		this.added.dispatch(n);
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
		this.changed.dispath(this);
	}
}