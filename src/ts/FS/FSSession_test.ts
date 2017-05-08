import {FSSession} from './FSSession';
import {FileContent,FileStat} from './FS';
import {assert} from 'chai';
import mocha = require('mocha');

let s = new FSSession(`s`, `craigmj`, `aikido`);

it('reads a non-existent file', function() {
	return s.Read(`/a.txt`)
	.then(
		(c:any)=>{
			assert.fail(`c`, `-rejection-`,`read of non-existent file expected to fail`);
		})
	.catch(
		(err:any)=>{
			// assert.fail(``,``,`checking our test fails`);
		});
});
it('writes a new file', function() {
	return s.Write('/a.txt', FileStat.New, 'This is some content')
	.then(
		()=>{
			return s.Read('/a.txt');
		})
	.then(
		(c:FileContent)=> {
			assert.equal(`This is some content`, c.Content);
			assert.equal(`/a.txt`, c.Name);
			assert.equal(FileStat.New, c.Stat);
		});
});
it(`writes a second file`, function() {
	// We write a second file, check it's written ok, then
	// read our first file and check that it's still ok as well.
	return s.Write(`/b.txt`, FileStat.New, `more content`)
	.then(
		()=>{
			return s.Read('/b.txt');
		})
	.then(
		(c:FileContent)=>{
			assert.equal(`more content`, c.Content);
			assert.equal('/b.txt', c.Name);
			assert.equal(FileStat.New, c.Stat);
		})
	.then(
		()=>{
			return s.Read('/a.txt');
		})
	.then(
		(c:FileContent)=> {
			assert.equal(`This is some content`, c.Content);
			assert.equal(`/a.txt`, c.Name);
			assert.equal(FileStat.New, c.Stat);
		});
});
it(`renames a file`, function() {
	return s.Rename('/b.txt','/c.txt')
	.then(
		()=>{
			return s.Read('/c.txt');
		})
	.then(
		(c:FileContent)=>{
			assert.equal(`more content`, c.Content);
			assert.equal('/c.txt', c.Name);
			assert.equal(FileStat.Changed, c.Stat);
		})
	.then(
		()=>{
			return s.Read('/a.txt');
		})
	.then(
		(c:FileContent)=> {
			assert.equal(`This is some content`, c.Content);
			assert.equal(`/a.txt`, c.Name);
			assert.equal(FileStat.New, c.Stat);
			return s.Stat(`/b.txt`);
		})
	.then(
		(fs)=>{
			assert.equal(FileStat.NotExist, fs);
		});
});
