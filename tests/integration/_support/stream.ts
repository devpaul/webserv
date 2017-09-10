import { Readable } from 'stream';

export function toString(stream: Readable): Promise<string> {
	return new Promise((resolve, reject) => {
		let data = '';

		stream.on('data', chunk => { data += chunk; });
		stream.on('end', () => { resolve(data); });
		stream.on('error', reject);
	});
}
