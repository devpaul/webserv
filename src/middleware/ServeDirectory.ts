import { Handler, HandlerResponse } from '../handlers/Handler';
import { statSync, readdir } from 'fs';
import { parse as parseUrl } from 'url';
import { join as joinPath } from 'path';
import { IncomingMessage, ServerResponse } from 'http';
import { log } from '../log';

export interface Options {
	rootDirectory?: ServeDirectory['rootDirectory'];
	basePath?: ServeDirectory['basePath'];
}

/**
 * Middleware for serving a list of files in a directory
 */
export default class ServeDirectory implements Handler {
	public rootDirectory: string;

	public basePath = '';

	constructor(options: Options | string = {}) {
		if (typeof options === 'string') {
			this.rootDirectory = options;
		}
		else {
			this.rootDirectory = options.rootDirectory || process.cwd();
			this.basePath = options.basePath || '';
		}
	}

	createHtml(currentDirectory: string, files: string[]) {
		const fileLinks: () => string = () => {
			return files.map((file) => {
				return `<a href="${ joinPath(this.basePath, currentDirectory, file) }">${ file }</a>`;
			}).join('<br>');
		};

		return '<!DOCTYPE html>' +
			'<html lang="en">' +
			'<head>' +
			'	<meta charset="UTF-8">' +
			'	<title>Title</title>' +
			'</head>' +
			'<body>' +
			`${ fileLinks() }` +
			'</body>' +
			'</html>';
	}

	handle(request: IncomingMessage, response: ServerResponse): Promise<HandlerResponse> {
		if (response.finished) {
			return Promise.resolve();
		}

		return new Promise<HandlerResponse>((resolve) => {
			const requestUrl = parseUrl(request.url);
			const location = joinPath(this.rootDirectory, requestUrl.pathname);

			if (this.isDirectory(location)) {
				log.debug(`ServeDirectory: listing contents of "${ location }"`);

				readdir(location, (err, files) => {
					if (err) {
						return;
					}

					const url = (<any> request).originalUrl ? parseUrl((<any> request).originalUrl) : requestUrl;
					response.end(this.createHtml(url.path, files));
					resolve();
				});
			}
			else {
				log.debug(`ServeDirectory: "${ location }" does not exist.`);
				resolve();
			}
		});
	}

	private isDirectory(location: string): boolean {
		try {
			const stats = statSync(location);
			return stats.isDirectory();
		}
		catch (e) {
		}

		return false;
	}
}
