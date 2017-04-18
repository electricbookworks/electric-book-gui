(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('EBW.js')) :
	typeof define === 'function' && define.amd ? define('main', ['EBW.js'], factory) :
	(factory(global.EBW));
}(this, (function (EBW) { 'use strict';

EBW = 'default' in EBW ? EBW['default'] : EBW;

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var Main = function Main() {
	classCallCheck(this, Main);

	console.log('Main::Main()');
};

document.addEventListener('DOMContentLoaded', function () {
	new Main();
	new EBW();
});

})));

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXMiOlsic3JjL2VzNi9tYWluLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBFQlcgZnJvbSAnRUJXLmpzJztcblxuY2xhc3MgTWFpbiB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdGNvbnNvbGUubG9nKGBNYWluOjpNYWluKClgKTtcblx0fVxufVxuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKGBET01Db250ZW50TG9hZGVkYCwgZnVuY3Rpb24oKSB7XG5cdG5ldyBNYWluKCk7XG5cdG5ldyBFQlcoKTtcbn0pOyJdLCJuYW1lcyI6WyJNYWluIiwibG9nIiwiZG9jdW1lbnQiLCJhZGRFdmVudExpc3RlbmVyIiwiRUJXIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztJQUVNQSxPQUNMLGdCQUFjOzs7U0FDTEMsR0FBUjs7O0FBSUZDLFNBQVNDLGdCQUFULHFCQUE4QyxZQUFXO0tBQ3BESCxJQUFKO0tBQ0lJLEdBQUo7Q0FGRDs7In0=
