import { resolve } from 'path';

import { HttpError, HttpStatus } from '../HttpError';
import { MiddlewareFactory } from '../interface';
import { log } from '../log';
import { getStat } from '../util/file/getStat';
import { sendFile } from '../util/file/sendFile';

export interface ServeFileProperties {
	path: string;
}

export const serveFile: MiddlewareFactory<ServeFileProperties> = ({ path }) => {
	const base = resolve(path);
	log.debug('serving file', base);

	return async (request, response) => {
		const stat = await getStat(path);

		if (stat.isFile()) {
			sendFile(request, response, path);
		} else {
			log.error(`serveFile middleware expected file "${path} to exist`);
			throw new HttpError(HttpStatus.NotFound);
		}
	};
};
