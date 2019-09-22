import { IncomingMessage } from 'http';
import { descriptorWrapper } from '../util/proxies';
import * as BusBoy from 'busboy';
import BufferedResponse from '../util/BufferedResponse';
import { Transform } from '../handlers/transform';
import '../polyfills';
import { log } from '../log';

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

/**
 * Creates a files property on the incoming request with any files being uploaded
 */
const incomingFiles: Transform = function(request: IncomingMessage): IncomingMessage {
	let buffer: BufferedResponse<IncomingFile>;

	if (request.method === 'POST') {
		return descriptorWrapper<IncomingMessage>(request, {
			files: {
				get() {
					if (!buffer) {
						buffer = setupBuffer(request);
					}
					return buffer[Symbol.asyncIterator].bind(buffer);
				},
				configurable: true
			}
		});
	}

	return request;
};

export interface IncomingFiles extends IncomingMessage {
	files(): AsyncIterableIterator<IncomingFile>;
}

export function hasIncomingFiles(request: any): request is IncomingFiles {
	return !!(request && request.hasOwnProperty('files'));
}

export default incomingFiles;
