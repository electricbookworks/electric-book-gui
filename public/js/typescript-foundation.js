// polyfill for required Foundation classes that TypeScript 
// doesn't play nice with.
(function() {
	window.TSFoundation = {
		'Reveal' : function(el,options) {
			return new Foundation.Reveal(el, options);
		}
	}
})();