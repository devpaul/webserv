import { join, resolve } from 'path';

export const projectRootDirectory = resolve(__dirname, '..', '..', '..');
export const examplesDirectory = resolve(__dirname, '..', '..', '..', 'examples');
export const serversDirectory = resolve(__dirname, '..', '_servers');

export function examples(...paths: string[]) {
	return join(examplesDirectory, ...paths);
}

export function servers(...paths: string[]) {
	return join(serversDirectory, ...paths);
}

export function projectRoot(...paths: string[]) {
	return join(projectRootDirectory, ...paths);
}
