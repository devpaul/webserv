import { Process } from "../interface";
import { IncomingMessage } from "http";
import * as BusBoy from 'busboy';
import { log } from "../log";
import BufferedResponse from "../util/BufferedResponse";
import { updateRequest } from "../util/request";

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
		updateRequest(request, {
			get() {
				if (!buffer) {
					buffer = setupBuffer(request);
				}
				return buffer[Symbol.asyncIterator].bind(buffer);
			},
			configurable: true
		});
	}
}

export interface IncomingFiles extends IncomingMessage {
	files(): AsyncIterableIterator<IncomingFile>;
}

export function hasIncomingFiles(request: any): request is IncomingFiles {
	return !!(request && request.hasOwnProperty('files'));
}
