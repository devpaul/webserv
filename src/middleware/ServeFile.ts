import { Handler, HandlerResponse } from '../handlers/Handler';
import { statSync } from 'fs';
import { parse as parseUrl } from 'url';
import { join as joinPath, resolve as resolvePath } from 'path';
import { IncomingMessage, ServerResponse } from 'http';
import { log } from '../log';
const send = require('send');

/**
 * Middleware for serving files from a specified directory
 *
 * Files are served relative to the provided root directory and url pathname. If files are not being served from
 * the root pathname the url pathname should be transformed.
 *
 * ```
 *    new Route().transform(relativeUrl('/match')).wrap(new ServeFile('./location'));
 * ```
 */
export default class ServeFile implements Handler {
	public rootDirectory: string;

	public searchDefaults: string[];

	/**
	 * @param rootDirectory the base directory to be used to find files
	 * @param searchDefaults when a directory is passed, search for these files in the provided order
	 */
	constructor(rootDirectory: string = process.cwd(), searchDefaults: string[] = [ 'index.html' ]) {
		this.rootDirectory = rootDirectory;
		this.searchDefaults = searchDefaults;
	}

	handle(request: IncomingMessage, response: ServerResponse): Promise<HandlerResponse> {
		if (response.finished) {
			return Promise.resolve();
		}

		return new Promise<HandlerResponse>((resolve) => {
			const requestUrl = parseUrl(request.url);
			const path = resolvePath(joinPath(this.rootDirectory, requestUrl.pathname));
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
