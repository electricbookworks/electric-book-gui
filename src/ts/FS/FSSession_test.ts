import {FSSession} from './FSSession';
import {assert} from 'chai';

let s = new FSSession(`s`, `craigmj`, `aikido`);
s.Read(`/a.txt`)
.then(
	(c)=>{
		assert.fail(`c`, `-rejection-`,`read of non-existent file expected to fail`);
	})
.catch(
	(err)=>{
		assert.fail(``,``,`checking our test fails`);
	});
