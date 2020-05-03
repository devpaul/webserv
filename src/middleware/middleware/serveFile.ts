import { resolve } from 'path';
import { HttpError, HttpStatus } from '../../core/HttpError';
import { MiddlewareFactory } from '../../core/interface';
import { log } from '../../core/log';
import { getStat } from '../../core/util/file/getStat';
import { sendFile } from '../../core/util/file/sendFile';

export interface ServeFileProperties {
	path: string;
}

export const serveFile: MiddlewareFactory<ServeFileProperties> = ({ path }) => {
	const base = resolve(path);
	log.debug('serving file', base);

	return async (request, response) => {
		const stat = await getStat(path);

		if (stat.isFile()) {
			await sendFile(request, response, path);
		} else {
			log.error(`serveFile middleware expected file "${path} to exist`);
			throw new HttpError(HttpStatus.NotFound);
		}
	};
};