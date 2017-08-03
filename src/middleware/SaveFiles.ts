import '../polyfills';
import { Handler, HandlerResponse } from '../handlers/Handler';
import { IncomingMessage, ServerResponse } from 'http';
import { hasIncomingFiles } from '../transforms/incomingFiles';
import * as path from 'path';
import { log } from '../log';
import mkdirp = require('mkdirp');
import * as fs from 'fs';

function htmlTemplate(body: string) {
	return `
<html>
<head>
	<title>Upload File</title>
</head>
<body>
	${ body }
</form>
</body>
</html>
`;
}

function defaultUploadForm() {
	return htmlTemplate(`
<form method="post" enctype="multipart/form-data">
<p>
	<input type="file" name="uploadedFiles" multiple>
</p>
<p>
	<input type="submit" value="Upload file">
</p>
	`);
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

export interface Options {
	allowOverwrite?: boolean;
	createUploadDirectory?: boolean;
	uploadForm?: UploadFile['uploadForm'];
	uploadResponse?: UploadFile['uploadResponse'];
}

export default class UploadFile implements Handler {
	readonly allowOverwrite: boolean;

	readonly createUploadDirectory: boolean;

	readonly directory: string;

	readonly uploadForm: () => string;

	readonly uploadResponse: (files: string[], failed: string[]) => string;

	constructor(directory: string, options: Options = {}) {
		this.directory = directory;
		this.allowOverwrite = options.allowOverwrite || false;
		this.createUploadDirectory = options.createUploadDirectory || false;
		this.uploadForm = options.uploadForm || defaultUploadForm;
		this.uploadResponse = options.uploadResponse || defaultUploadResponse;
	}

	async handle(request: IncomingMessage, response: ServerResponse): Promise<HandlerResponse> {
		if (this.createUploadDirectory) {
			await new Promise((resolve, reject) => {
				mkdirp(path.resolve(this.directory), (err) => {
					err ? reject(err) : resolve();
				});
			});
		}

		if (request.method === 'POST') {
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
			response.write(this.uploadResponse(files, failed));
			response.end();
		}
		else if (request.method === 'GET') {
			response.write(this.uploadForm());
			response.end();
		}
	}
}
