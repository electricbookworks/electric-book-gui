
	class joinIterators {
		constructor (iters) {
			this.iters = iters;
			this.i = 0;
		}
		next() {
			if (this.i == this.iters.length) {
				return { 'value':undefined, 'done':true }
			}
			let r = this.iters[this.i].next();
			if (!r.done) {
				return r;
			}
			this.i++;
			return this.next();
		}
		[Symbol.iterator]() {
			return this;
		}
	}

	class querySelectorAllIterator {
		constructor(qs) {
			this.qs = qs;
			this.i = 0;
		}
		next() {
			if (this.i == this.qs.length) {
				return { 'value':undefined, 'done':true }
			}
			return { 'value': this.qs.item(this.i++), 'done':false };
		}
		[Symbol.iterator]() {
			return this;
		}
	}

	let QuerySelectorAllIterate = function(el, query) {
		let els = [];
		if ('function'==typeof el.matches) {
			if (el.matches(query)) {
				els.push(el);
			}
		} else if ('function'==typeof el.matchesSelector) {
			if (el.matchesSelector(query)) {
				els.push(el);
			}
		}
		let qs = el.querySelectorAll(query);
		let i = qs[Symbol.iterator];
		if ('function'==typeof i) {
			return new joinIterators([els[Symbol.iterator](), qs[Symbol.iterator]()])
		}
		return new joinIterators([els[Symbol.iterator](), new querySelectorAllIterator(qs)]);
	}	

