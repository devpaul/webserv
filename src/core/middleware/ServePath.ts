import { Handler, HandlerResponse } from '../handlers/Handler';
import { existsSync, readdir, statSync } from 'fs';
import { parse as parseUrl } from 'url';
import { join } from 'path';
import { IncomingMessage, ServerResponse } from 'http';
import { log } from '../log';
import * as send from 'send';
import { htmlTemplate } from '../util/templates';

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
	/**
	 * Require directories to have a trailing slash. Forward directory requests that do not have a trailing slash.
	 */
	trailingSlash?: boolean;
}

function listFileContents(request: IncomingMessage, response: ServerResponse, target: string) {
	const url = parseUrl((<any>request).originalUrl || (<any>request).url).pathname;

	return new Promise((resolve) => {
		readdir(target, (err, files) => {
			if (err) {
				throw err;
			}

			const fileLinks = files
				.map((file) => {
					return `<a href="${join(url, file)}">${file}</a>`;
				})
				.join('<br>');

			response.write(htmlTemplate(fileLinks));
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

	readonly searchDefaults: string[];

	readonly trailingSlash: boolean;

	constructor(options: ServePathOptions | string = {}) {
		if (typeof options === 'string') {
			options = { basePath: options };
		}
		const {
			basePath = process.cwd(),
			searchDefaults = ['index.html'],
			directoryHandler = listFileContents,
			trailingSlash = true
		} = options;

		this.basePath = basePath;
		this.searchDefaults = searchDefaults;
		this.directoryHandler = directoryHandler;
		this.trailingSlash = trailingSlash;
	}

	handle(request: IncomingMessage, response: ServerResponse) {
		const path = this.getPath(request);

		if (response.finished || !path) {
			return;
		}
		if (path.indexOf(this.basePath) === -1) {
			log.debug(`Attempted to access ${path} from ${this.basePath} with ${request.url}`);
			return this.forbidden(response);
		}

		const stat = statSync(path);

		if (stat.isDirectory()) {
			if (!this.isMissingTrailingSlash(request.url)) {
				return this.redirectWithSlash(request.url, response);
			}

			const search = this.findDefaultFile(path);
			return search ? this.sendFile(request, response, search) : this.listDirectory(request, response, path);
		} else {
			return this.sendFile(request, response, path);
		}
	}

	protected async listDirectory(request: IncomingMessage, response: ServerResponse, target: string) {
		if (this.directoryHandler) {
			log.debug(`handling directory contents for ${target}`);
			await this.directoryHandler(request, response, target);
		}
	}

	protected isMissingTrailingSlash(url: string) {
		if (this.trailingSlash) {
			const pathname = parseUrl(url).pathname;
			return pathname.length <= 1 || pathname.charAt(pathname.length - 1) === '/';
		}

		return true;
	}

	protected redirectWithSlash(url: string, response: ServerResponse) {
		response.statusCode = 301;
		response.setHeader('Location', url + '/');
		response.end();
		log.debug(`Redirecting ${url} => ${url}/`);
	}

	protected forbidden(response: ServerResponse) {
		response.statusCode = 403;
		response.end();
	}

	protected async sendFile(request: IncomingMessage, response: ServerResponse, target: string) {
		return new Promise<HandlerResponse>((resolve, reject) => {
			log.debug(`ServePath: serving file "${target}"`);
			send(request, target, {
				dotfiles: 'deny',
				index: false
			})
				.on('end', function() {
					response.end();
					resolve();
				})
				.on('error', reject)
				.pipe(response);
		});
	}

	protected findDefaultFile(path: string): string | null {
		for (let searchFile of this.searchDefaults) {
			const searchTarget = join(path, searchFile);
			if (existsSync(searchTarget) && statSync(searchTarget).isFile()) {
				return searchTarget;
			}
		}

		return null;
	}

	/**
	 * Gets the file path form the request and ensures that a file exists at that location
	 * @return the file path if it exists; otherwise null
	 */
	protected getPath(request: IncomingMessage): string | null {
		const url = parseUrl(request.url);
		const target = join(this.basePath, url.pathname);

		return existsSync(target) ? target : null;
	}
}
