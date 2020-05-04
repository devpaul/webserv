import { exists } from 'fs';

export function fileExists(path: string): Promise<boolean> {
	return new Promise((done) => {
		exists(path, done);
	});
}
