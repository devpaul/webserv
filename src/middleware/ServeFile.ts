import { Handler, HandlerResponse } from '../handlers/Handler';
import { statSync } from 'fs';
import { parse as parseUrl } from 'url';
import { join as joinPath, relative, resolve as resolvePath } from 'path';
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
	readonly basePath: string;

	readonly isFile: boolean;

	readonly searchDefaults: string[];

	/**
	 * @param basePath the base directory to be used to find files
	 * @param searchDefaults when a directory is passed, search for these files in the provided order
	 */
	constructor(basePath: string = process.cwd(), searchDefaults: string[] = [ 'index.html' ]) {
		this.basePath = basePath;
		this.isFile = statSync(this.basePath).isFile();
		this.searchDefaults = this.isFile ? searchDefaults : [];
	}

	handle(request: IncomingMessage, response: ServerResponse) {
		if (response.finished) {
			return;
		}

		if (this.isFile) {
			return this.serveFile(request, response);
		}
		else {
			return this.serveFileFromDirectory(request, response);
		}
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

	private serveFile(request: IncomingMessage, response: ServerResponse, location = resolvePath(this.basePath)) {
		const file = relative(location, this.basePath);
		console.log(this.basePath, location, file);
		return new Promise<HandlerResponse>((resolve, reject) => {
			log.debug(`ServeFile: serving file "${ location }"`);
			send(request, file, {
				dotfiles: 'deny',
				root: this.basePath
			}).on('end', function () {
					response.end();
					resolve('immediate');
				})
				.on('error', reject)
				.pipe(response);
		});
	}

	private serveFileFromDirectory(request: IncomingMessage, response: ServerResponse) {
		return new Promise<HandlerResponse>((resolve) => {
			const requestUrl = parseUrl(request.url);
			const path = resolvePath(joinPath(this.basePath, requestUrl.pathname));
			console.log('path', path);
			const location = this.mapToLocalFile(path, true);

			if (location) {
				return this.serveFile(request, response, location);
			}
			else {
				log.debug(`ServeFile: "${ location } does not exist`);
				resolve();
			}
		});
	}
}
