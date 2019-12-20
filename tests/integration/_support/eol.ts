import { resolve } from 'path';
import { readFileSync } from 'fs';

export function detectEol() {
	const winOL = Buffer.from('\r\n');
	const path = resolve(__dirname, '..', '_assets', 'sample1', 'index.html');
	const contents = readFileSync(path);
	console.log('compare', winOL.compare(contents, contents.byteLength - 2));
	return winOL.compare(contents, contents.byteLength - winOL.byteLength) === 0 ? '\r\n' : '\n';
}
