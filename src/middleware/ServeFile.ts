import { Handler, Response } from '../handlers/Handler';
import { statSync } from 'fs';
import { parse as parseUrl } from 'url';
import { join as joinPath } from 'path';
import { IncomingMessage, ServerResponse } from 'http';
import { log } from '../log';
const send = require('send');

export default class ServeFile implements Handler {
	public rootDirectory: string;

	public searchDefaults: string[];

	constructor(rootDirectory: string = process.cwd(), searchDefaults: string[] = [ 'index.html' ]) {
		this.rootDirectory = rootDirectory;
		this.searchDefaults = searchDefaults;
	}

	handle(request: IncomingMessage, response: ServerResponse): Promise<Response> {
		if (response.finished) {
			return Promise.resolve();
		}

		return new Promise<Response>((resolve) => {
			const requestUrl = parseUrl(request.url);
			const path = joinPath(this.rootDirectory, requestUrl.pathname);
			const location = this.mapToLocalFile(path, true);

			if (location) {
				log.debug(`ServeFile: serving file "${ location }"`);
				send(request, location)
					.on('end', function () {
						response.end();
						resolve('immediate');
					})
					.pipe(response);
			}
			else {
				log.debug(`ServeFile: "${ location } does not exist`);
				resolve();
			}
		});
	}

	protected mapToLocalFile(location: string, handleDirectories: boolean = false): string | null {
		try {
			const stats = statSync(location);

			if (handleDirectories && stats.isDirectory()) {
				return this.directoryHandler(location);
			}

			return location;
		}
		catch (e) {
		}

		return null;
	}

	protected directoryHandler(directory: string): string | null {
		for (let i = 0; i < this.searchDefaults.length; i++) {
			const filename = this.searchDefaults[i];
			const location = this.mapToLocalFile(joinPath(directory, filename));

			if (location) {
				return location;
			}
		}
	}
}
