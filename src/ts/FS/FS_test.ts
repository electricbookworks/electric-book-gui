import {expect} from 'chai';

function helloworld() {
	return "hi world";
}

describe("helloworld function", ()=>{
	it('should return "hi world"', ()=>{
		const result = helloworld();
		expect(result).to.equal('hi world');
	});
});