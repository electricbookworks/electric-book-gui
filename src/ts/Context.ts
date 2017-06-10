import {API} from './API';
import {EBW} from './EBW';

// Context is a general class passed through to most sub-classes that allows
// us to track the repo- and user-specific things that are common to pretty
// much all requests. In some senses, it's a bit like a global namespace,
// just much better controlled because it's a class we defined and pass around,
// and can therefore modify for children if that is appropriate at some point.
export class Context {
	constructor(protected el: HTMLElement, public RepoOwner: string, public RepoName: string) {
		// I should probably also pass the EBW in the context,
		// but since _all_ of the EBW methods are static, it is
		// pretty unnecessary
	}
	API() : API {
		return EBW.API();
	}
	EBW() : EBW {
		return new EBW();
	}
	GetAttribute(key: string): string {
		if (this.el) {
			return this.el.getAttribute(key);
		}
		return ``;
	}
}