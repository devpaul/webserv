import { readFile } from 'fs';

export function readJsonFile<T = unknown>(filePath: string) {
	return new Promise<T>((resolve, reject) => {
		readFile(filePath, (err, data) => {
			if (err) {
				reject(err);
			} else {
				resolve(JSON.parse(data.toString()));
			}
		});
	});
}
