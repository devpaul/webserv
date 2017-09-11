import { Handler, HandlerResponse } from '../handlers/Handler';
import { readdir, statSync } from 'fs';
import { parse as parseUrl } from 'url';
import { join, relative } from 'path';
import { IncomingMessage, ServerResponse } from 'http';
import { log } from '../log';
import * as send from 'send';

export interface ServePathOptions {
	/**
	 * the base directory to be used to find files
	 */
	basePath?: string;
	/**
	 * Overrides the default directory handler
	 */
	directoryHandler?: ServePath['directoryHandler'];
	/**
	 * when a directory is passed, search for these files in the provided order
	 */
	searchDefaults?: string[];
}

function listFileContents(request: IncomingMessage, response: ServerResponse, basePath: string) {
	const url = parseUrl((<any> request).originalUrl || (<any> request).url).pathname;
	const directory = parseUrl(request.url).pathname;
	const path = join(basePath, directory);

	return new Promise((resolve) => {
		readdir(path, (err, files) => {
			if (err) {
				throw err;
			}

			const fileLinks = files.map((file) => {
				return `<a href="${ join(url, file) }">${ file }</a>`;
			}).join('<br>');

			response.write(
`<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>Title</title>
</head>
<body>
	${ fileLinks }
</body>
</html>`);

			response.end();
			resolve();
		});
	});
}

/**
 * Middleware for serving files from a specified directory
 *
 * Files are served relative to the provided root directory and url pathname. If files are not being served from
 * the root pathname the url pathname should be transformed.
 *
 * ```
 *    new Route().transform(relativeUrl('/match')).wrap(new ServePath('./location'));
 * ```
 */
export default class ServePath implements Handler {
	readonly basePath: string;

	readonly directoryHandler?: (request: IncomingMessage, response: ServerResponse, basePath: string) => Promise<any>;

	readonly isFile: boolean;

	readonly searchDefaults: string[];

	constructor(options: ServePathOptions = {}) {
		const {
			basePath = process.cwd(),
			searchDefaults = [ 'index.html' ],
			directoryHandler = listFileContents
		} = options;

		this.basePath = basePath;
		this.isFile = statSync(this.basePath).isFile();
		this.searchDefaults = this.isFile ? searchDefaults : [];
		this.directoryHandler = directoryHandler;
	}

	handle(request: IncomingMessage, response: ServerResponse) {
		if (response.finished) {
			return;
		}

		const path = this.isFile ? '' : relative(this.basePath, join(this.basePath, parseUrl(request.url).pathname));

		return new Promise<HandlerResponse>((resolve, reject) => {
			log.debug(`ServePath: serving file "${ path }"`);
			send(request, path, {
				dotfiles: 'deny',
				index: this.searchDefaults,
				root: this.basePath
			})
				.on('end', function () {
					response.end();
					resolve('immediate');
				})
				.on('error', reject)
				.on('directory', (response: ServerResponse) => {
					if (this.directoryHandler) {
						this.directoryHandler(request, response, this.basePath).then(() => {
							resolve('immediate');
						});
					}
				})
				.pipe(response);
		});
	}
}
