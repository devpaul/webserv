import { readdir } from 'fs';

export function readDir(path: string) {
	return new Promise<string[]>((resolve, reject) => {
		readdir(path, (err, files) => {
			if (err) {
				reject(err);
			} else {
				resolve(files);
			}
		});
	});
}
