import {Node,NodeType} from './Node';

export class FileSystem {
	constructor(public root: Node) {}
	NodeFromPath(path: string): Node|undefined {
		return this.from_path_recurse(this.path_array(path), this.root, null);
	};

	PathFromNode(node: Node): string {
		return '/' + node.parents().map( (n)=>n.name ).join(`/`);
	};

	FindOrCreateFileNode(path: string, data: any) : Node|undefined {
		return this.from_path_recurse(this.path_array(path),
			this.root,
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

	path_array(path:string) : Array<string> {
		let p = path.split("/");
		if (``==p[0]) {
			p = p.slice(1);
		}
		return p;
	}

	from_path_recurse(
		path: Array<string>, n: Node, 
		handler:(
			path:Array<string>, 
			parent:Node)=>Node|undefined)
		: Node|undefined 
	{
		let c = n.child(path[0]);
		if (undefined==c && handler) {
			c = handler(path, n);
		}
		if (undefined==c || path.length==1) {
			return c
		}
		return this.from_path_recurse(path.slice(1), c, handler);
	}
}


