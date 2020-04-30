import { readFileSync } from 'fs';
import { servers } from './config';

export function detectEol() {
	const winOL = Buffer.from('\r\n');
	const path = servers('assets', 'sample1', 'index.html');
	const contents = readFileSync(path);
	return winOL.compare(contents, contents.byteLength - winOL.byteLength) === 0 ? '\r\n' : '\n';
}
