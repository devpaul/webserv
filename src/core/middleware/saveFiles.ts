import { createWriteStream, existsSync } from 'fs';
import mkdirp = require('mkdirp');
import { basename, join, resolve as resolvePath } from 'path';

import { HttpError, HttpStatus } from '../HttpError';
import { MiddlewareFactory } from '../interface';
import { log } from '../log';
import { hasIncomingFiles } from '../processors/file.processor';

export interface SaveFilesProperties {
	allowOverwrite?: boolean;
	createUploadDirectory?: boolean;
	directory: string;
}

export const saveFiles: MiddlewareFactory<SaveFilesProperties> = ({
	allowOverwrite = false,
	createUploadDirectory = false,
	directory
}) => {
	const uploadDirectory = resolvePath(directory);
	if (createUploadDirectory) {
		mkdirp.sync(uploadDirectory);
	}

	return async (request) => {
		if (request.method !== 'POST') {
			throw new HttpError(HttpStatus.BadRequest);
		}

		let files: string[] = [];
		let failed: string[] = [];

		if (hasIncomingFiles(request)) {
			for await (let { file, filename } of request.files()) {
				const absoluteFilename = resolvePath(join(directory, basename(filename)));

				if (allowOverwrite || !existsSync(absoluteFilename)) {
					file.pipe(createWriteStream(absoluteFilename));
					log.info(`Saved ${filename} to ${absoluteFilename}`);
					files.push(filename);
				} else {
					file.resume();
					log.warn(`File already exists! ${absoluteFilename}`);
					failed.push(filename);
				}
			}
		} else {
			log.warn('request contains no files property. Was the file processor applied?');
		}

		return {
			files,
			failed
		};
	};
};
