import * as BusBoy from 'busboy';
import { IncomingMessage } from 'http';

import { Process } from '../interface';
import { log } from '../log';
import BufferedResponse from '../util/BufferedResponse';

export interface IncomingFile {
	fieldName: string;
	file: NodeJS.ReadableStream;
	filename: string;
	encoding: string;
	mimeType: string;
}

function setupBuffer(request: IncomingMessage): BufferedResponse<IncomingFile> {
	const busboy = new BusBoy({
		headers: request.headers
	});

	const buffer: BufferedResponse<IncomingFile> = new BufferedResponse<IncomingFile>();

	busboy.on('file', (fieldName, file, filename, encoding, mimeType) => {
		log.info(`Uploaded file: ${filename}, encoding ${encoding}, mimetype: ${mimeType}`);
		buffer.add({
			fieldName,
			file,
			filename,
			encoding,
			mimeType
		});
	});

	busboy.on('finish', function() {
		buffer.close();
	});

	request.pipe(busboy);

	return buffer;
}

export const fileProcessor: Process = (request) => {
	let buffer: BufferedResponse<IncomingFile>;

	if (request.method.toUpperCase() === 'POST') {
		Object.defineProperty(request, 'files', {
			get() {
				if (!buffer) {
					buffer = setupBuffer(request);
				}
				return buffer[Symbol.asyncIterator].bind(buffer);
			},
			configurable: true
		});
	}
};

export interface IncomingFiles extends IncomingMessage {
	files(): AsyncIterableIterator<IncomingFile>;
}

export function hasIncomingFiles(request: any): request is IncomingFiles {
	return !!(request && request.hasOwnProperty('files'));
}
