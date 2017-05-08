import {assert} from 'chai';

function helloworld() {
	return "hi world";
}

(function(){ 
	assert.equal(helloworld(),`hi world`, `Doesn't seem to have worked`);
})();
