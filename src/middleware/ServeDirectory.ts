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

	handle(request: IncomingMessage, response: ServerResponse): Promise<Response> {
		return new Promise<Response>((resolve) => {
			const requestUrl = parseUrl(request.url);
			const location = joinPath(this.rootDirectory, requestUrl.path);
			console.log(location);
			const stats = statSync(location);

			if (stats.isDirectory()) {
				readdir(location, (err, files) => {
					if (err) {
						return;
					}

					console.log(files);
					response.end(files.toString());
					resolve();
				});
			}
		});
	}
}
