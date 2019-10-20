import { GuardFactory } from '../interface';
import { parse as parseUrl } from 'url';
import * as pathToRegexp from 'path-to-regexp';
import { Key } from 'path-to-regexp';
import { log } from '../log';
import { updateRequest } from '../util/request';

export interface PathGuardProperties {
	match: RegExp | string;
}

export interface Params {
	[key: string]: string;
}

export const routeMatch = Symbol();

function parameterizeMatches(keys: Key[], matches: RegExpExecArray): Params {
	const params: any = {};

	for (let i = 0; i < keys.length; i++) {
		const key = keys[i];
		const match = matches[i + 1];
		if (match) {
			params[key.name] = decodeURIComponent(match);
			if (key.repeat) {
				params[key.name] = params[key.name].split(key.delimiter);
			}
		}
	}

	return params;
}

function relativeUrl(url: string, keys: Key[], matches: RegExpExecArray): string {
	if (keys.length === 0) {
		// There are no wildcards. The entire route was matched.
		return '/';
	} else if (keys[keys.length - 1].pattern === '.*') {
		// the last match was a wildcard. Reduce the incoming url.
		return matches[matches.length - 1] || '/';
	}
	return url;
}

export const pathGuard: GuardFactory<PathGuardProperties> = ({ match }) => {
	if (typeof match === 'string') {
		const keys: Key[] = [];
		const regex = pathToRegexp(match, keys);
		log.debug(`Created regexp ${regex} to match ${match}`);
		log.debug('route keys', keys);

		return (request) => {
			const url = parseUrl(request.url);
			const result = regex.exec(url.pathname);

			if (result) {
				updateRequest(request, {
					originalUrl: request.url,
					params: parameterizeMatches(keys, result),
					url: relativeUrl(request.url, keys, result)
				});
			}
			return !!result;
		};
	}

	return (request) => {
		const url = parseUrl(request.url);
		return match.test(url.pathname);
	};
};
