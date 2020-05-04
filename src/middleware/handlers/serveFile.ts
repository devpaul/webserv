import { resolve } from 'path';
import { HttpError, HttpStatus } from '../../core/HttpError';
import { HandlerFactory } from '../../core/interface';
import { log } from '../../core/log';
import { getStat } from '../util/file/getStat';
import { sendFile } from '../util/file/sendFile';

export interface ServeFileProperties {
	path: string;
}

export const serveFile: HandlerFactory<ServeFileProperties> = ({ path }) => {
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
