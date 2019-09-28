import { MiddlewareFactory } from "../interface";
import { parse as parseUrl } from 'url';
import { IncomingMessage, ServerResponse } from "http";
import { join, resolve } from "path";
import { existsSync, statSync, readdir } from "fs";
import { HttpError, HttpStatus } from "../HttpError";
import { log } from "../log";
import { forwarder } from "./forwarder";
import * as send from 'send';

export interface ServeProperties {
	basePath?: string;
	searchDefaults?: string[];
	trailingSlash?: boolean;
}

function getPath(basePath: string, request: IncomingMessage): string | null {
	const url = parseUrl(request.url);
	const target = join(basePath, url.pathname);

	return existsSync(target) ? target : null;
}

function isMissingTrailingSlash(url: string) {
	const pathname = parseUrl(url).pathname;
	return pathname.length <= 1 || pathname.charAt(pathname.length - 1) === '/';
}

function findDefaultFile(path: string, search: string[]): string | null {
	for (let searchFile of search) {
		const searchTarget = join(path, searchFile);
		if (existsSync(searchTarget) && statSync(searchTarget).isFile()) {
			return searchTarget;
		}
	}

	return null;
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

export const serve: MiddlewareFactory<ServeProperties> = ({ basePath = process.cwd(), trailingSlash, searchDefaults = ['index.html'] }) => {
	const base = resolve(basePath);

	return (request, response) => {
		const path = getPath(base, request);

		if (!path) {
			throw new HttpError(HttpStatus.NotFound);
		}
		if (path.indexOf(base) === -1) {
			log.debug(`Attempted to access ${path} from ${basePath} with ${request.url}`);
			throw new HttpError(HttpStatus.Forbidden);
		}

		const stat = statSync(path);

		if (stat.isDirectory()) {
			if (trailingSlash && !isMissingTrailingSlash(request.url)) {
				return forwarder({ location: request.url + '/' })(request, response);
			}

			const search = findDefaultFile(path, searchDefaults);
			return search ? sendFile(request, response, search) : listDirectoryContents(path);
		} else {
			return sendFile(request, response, path);
		}
	}
}
