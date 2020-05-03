import { access, constants, readdir } from 'fs';
import { join, resolve } from 'path';
import { parse as parseUrl } from 'url';
import { HttpError, HttpStatus } from '../../core/HttpError';
import { HandlerFactory } from '../../core/interface';
import { log } from '../../core/log';
import { getStat } from '../util/file/getStat';
import { sendFile } from '../util/file/sendFile';
import { forwarder } from './forwarder';

export interface ServeProperties {
	basePath?: string;
	searchDefaults?: string[];
	showDirectoryContents?: boolean;
	trailingSlash?: boolean;
	extensions?: string[];
}

async function getPath(target: string, extensions: string[] = []) {
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

export const serve: HandlerFactory<ServeProperties> = ({
	basePath = process.cwd(),
	trailingSlash,
	showDirectoryContents = true,
	searchDefaults = ['index.html'],
	extensions = ['', '.js']
}) => {
	const base = resolve(basePath);
	log.debug('serving path', base);

	return async (request, response) => {
		const target = join(base, decodeURI(parseUrl(request.url).pathname));
		const path = await getPath(target, extensions);
		log.debug(`Request to serve ${target}`);

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
			if (search) {
				return sendFile(request, response, search);
			} else if (showDirectoryContents) {
				return listDirectoryContents(path);
			} else {
				throw new HttpError(HttpStatus.NotFound);
			}
		} else {
			return sendFile(request, response, path);
		}
	};
};
