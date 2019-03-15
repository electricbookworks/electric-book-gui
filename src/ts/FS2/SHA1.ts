import jsSHA = require ('../sha1');

export function SHA1(input:string) {
	let sha = new jsSHA("SHA-1", "TEXT");
	sha.update(input);
	return sha.getHash("HEX");
}
