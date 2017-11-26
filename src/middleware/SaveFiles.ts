import '../polyfills';
import { Handler, HandlerResponse } from '../handlers/Handler';
import { IncomingMessage, ServerResponse } from 'http';
import { hasIncomingFiles } from '../transforms/incomingFiles';
import * as path from 'path';
import { log } from '../log';
import mkdirp = require('mkdirp');
import * as fs from 'fs';
import { htmlTemplate } from '../util/templates';

export interface Config {
	allowOverwrite?: boolean;
	createUploadDirectory?: boolean;
	directory: string;
	uploadResponse?: SaveFiles['uploadResponse'];
}

function defaultUploadResponse(files: string[], failed: string[]) {
	if (files.length || failed.length) {
		const uploaded = files.map(file => `<p>Saved: ${ file }</p>`).join('\n');
		const notUploaded = failed.map(file => `<p>Failed: ${ file }</p>`).join('\n');
		return htmlTemplate(uploaded + notUploaded);
	}
	else {
		return htmlTemplate('No files uploaded');
	}
}

export default class SaveFiles implements Handler {
	readonly allowOverwrite: boolean;

	readonly createUploadDirectory: boolean;

	readonly directory: string;

	readonly uploadResponse: (files: string[], failed: string[]) => string;

	constructor(config: Config) {
		this.allowOverwrite = config.allowOverwrite || false;
		this.createUploadDirectory = config.createUploadDirectory || false;
		this.directory = config.directory;
		this.uploadResponse = config.uploadResponse || defaultUploadResponse;
	}

	async handle(request: IncomingMessage, response: ServerResponse): Promise<HandlerResponse> {
		if (request.method !== 'POST') {
			return;
		}

		if (this.createUploadDirectory) {
			await new Promise((resolve, reject) => {
				mkdirp(path.resolve(this.directory), (err) => {
					err ? reject(err) : resolve();
				});
			});
		}

		let files: string[] = [];
		let failed: string[] = [];

		if (hasIncomingFiles(request)) {
			for await (let { file, filename } of request.files()) {
				const absoluteFilename = path.resolve(path.join(this.directory, path.basename(filename)));

				if (this.allowOverwrite || !fs.existsSync(absoluteFilename)) {
					file.pipe(fs.createWriteStream(absoluteFilename));
					log.info(`Saved ${ filename } to ${ absoluteFilename }`);
					files.push(filename);
				}
				else {
					file.resume();
					log.warn(`File already exists! ${ absoluteFilename }`);
					failed.push(filename);
				}
			}
		}
		else {
			log.warn('request contains no files property. Was the incomingFiles transform applied?');
		}

		response.write(this.uploadResponse(files, failed));
		response.end();
	}
}
