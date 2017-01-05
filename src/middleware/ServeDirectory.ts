import { Handler, Response } from '../handlers/Handler';
import { statSync, readdir } from 'fs';
import { parse as parseUrl } from 'url';
import { join as joinPath } from 'path';
import { IncomingMessage, ServerResponse } from 'http';

export default class ServeDirectory implements Handler {
	public rootDirectory: string;

	constructor(rootDirectory: string) {
		this.rootDirectory = rootDirectory;
	}

	createHtml(currentDirectory: string, files: string[]) {
		function fileLinks(): string {
			return files.map(function (file) {
				return `<a href="${ joinPath(currentDirectory, file) }">${ file }</a>`
			}).join('<br>');
		}

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

	handle(request: IncomingMessage, response: ServerResponse): Promise<Response> {
		if (response.finished) {
			return Promise.resolve();
		}

		return new Promise<Response>((resolve) => {
			const requestUrl = parseUrl(request.url);
			const location = joinPath(this.rootDirectory, requestUrl.path);

			if (this.isDirectory(location)) {
				readdir(location, (err, files) => {
					if (err) {
						return;
					}

					response.end(this.createHtml(location, files));
					resolve('immediate');
				});
			}
			else {
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
