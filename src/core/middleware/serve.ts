import { MiddlewareFactory } from '../interface';
import { parse as parseUrl, UrlWithStringQuery } from 'url';
import { IncomingMessage, ServerResponse } from 'http';
import { join, resolve } from 'path';
import { readdir, access, constants, stat, Stats } from 'fs';
import { HttpError, HttpStatus } from '../HttpError';
import { log } from '../log';
import { forwarder } from './forwarder';
import * as send from 'send';

export interface ServeProperties {
	basePath?: string;
	searchDefaults?: string[];
	trailingSlash?: boolean;
	extensions?: string[];
}

async function getPath(basePath: string, url: UrlWithStringQuery, extensions: string[] = []) {
	const target = join(basePath, url.pathname);

	if (await checkAccess(target)) {
		return target;
	}

	for (let extension of extensions) {
		const path = target + extension;
		if (await checkAccess(path)) {
			return path;
		}
	}
}

function checkAccess(target: string, mode: number = constants.F_OK) {
	return new Promise((resolve) => {
		access(target, mode, (err) => {
			err ? resolve() : resolve(target);
		});
	});
}

function getStat(target: string): Promise<Stats> {
	return new Promise((resolve, reject) => {
		stat(target, (err, stats) => {
			err ? reject(err) : resolve(stats);
		});
	});
}

function isMissingTrailingSlash(url: string) {
	const pathname = parseUrl(url).pathname;
	return pathname.length <= 1 || pathname.charAt(pathname.length - 1) === '/';
}

async function findDefaultFile(path: string, search: string[]) {
	for (let searchFile of search) {
		const searchTarget = join(path, searchFile);
		if ((await checkAccess(searchTarget)) && (await getStat(searchTarget)).isFile()) {
			return searchTarget;
		}
	}
}

function listDirectoryContents(target: string) {
	return new Promise((resolve) => {
		readdir(target, (err, files) => {
			if (err) {
				throw err;
			}

			resolve({
				directory: target,
				files
			});
		});
	});
}

function sendFile(request: IncomingMessage, response: ServerResponse, target: string) {
	return new Promise<void>((resolve, reject) => {
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

export const serve: MiddlewareFactory<ServeProperties> = ({
	basePath = process.cwd(),
	trailingSlash,
	searchDefaults = ['index.html'],
	extensions = ['', '.js']
}) => {
	const base = resolve(basePath);
	log.debug('serving path', base);

	return async (request, response) => {
		const path = await getPath(base, parseUrl(request.url), extensions);

		if (!path) {
			throw new HttpError(HttpStatus.NotFound);
		}
		if (path.indexOf(base) === -1) {
			log.debug(`Attempted to access ${path} from ${basePath} with ${request.url}`);
			throw new HttpError(HttpStatus.Forbidden);
		}

		const stat = await getStat(path);

		if (stat.isDirectory()) {
			if (trailingSlash && isMissingTrailingSlash(request.url)) {
				return forwarder({ location: request.url + '/' })(request, response);
			}

			const search = await findDefaultFile(path, searchDefaults);
			return search ? sendFile(request, response, search) : listDirectoryContents(path);
		} else {
			return sendFile(request, response, path);
		}
	};
};
