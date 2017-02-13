import { HandlerFunction, Response, Handler } from './Handler';
import { IncomingMessage } from 'http';
import { ServerResponse } from 'http';
import { parse as parseUrl } from 'url';
import { overrideWrapper } from '../util/proxies';

export interface FilterFunction {
	(request: IncomingMessage): boolean;
}

export type Partial<T> = {
	[P in keyof T]?: T[P];
};

export type FilterObject = Partial<IncomingMessage>;

export declare type Filter = string | RegExp | FilterFunction | FilterObject;

/**
 * Apply a filter that will execute the handler if the supplied filter matches. If a string
 * or a RegExp are supplied they will be compared against the incoming URL. A filter function is
 * passed the incoming request allowing for more complex filtering.
 *
 * @param handler the handler to be executed
 * @param filter the filter that must pass for the handler to be executed
 */
export function filter(handler: HandlerFunction, filter: Filter): HandlerFunction {
	let filterFunction: FilterFunction = createFilter(filter);

	return function (request: IncomingMessage, response: ServerResponse): Promise<Response> {
		if (!filterFunction(request)) {
			return Promise.resolve();
		}

		return handler(request, response);
	};
}

/**
 * Wrap a Handler in a Proxy that filters #handle()
 *
 * @param handler the Handler to be proxied
 * @param f the filter that must pass for the handler to be executed
 * @return {Handler} a proxied version of the handler
 */
export function proxy(handler: Handler, f: Filter): Handler {
	const filterFunction = createFilter(f);

	return overrideWrapper(handler, {
		handle: filter(handler.handle.bind(handler), filterFunction)
	});
}

/**
 * Create a filter that matches on the request's http method
 *
 * @param method the http method to match
 */
export function method(method: string): FilterFunction {
	return filterObject({
		method: method.toLowerCase()
	});
}

/**
 * This is an OR operator for filters. It combines a list of filters together into a single filter function so
 * the first condition that passes will pass the entire filter
 *
 * @param filters a series of filters to be combined
 */
export function first(... filters: Filter[]): FilterFunction {
	const filterFunctions = filters.map(createFilter);

	return function (request: IncomingMessage): boolean {
		return filterFunctions.some(function (filter) {
			return filter(request);
		});
	};
}

/**
 * This is an AND operator for filters. It combines a list of filters together into a single filter function and
 * requires that all conditions pass to pass the filter
 *
 * @param filters a series of filters to be combined
 */
export function every(... filters: Filter[]): FilterFunction {
	const filterFunctions = filters.map(createFilter);

	return function (request: IncomingMessage): boolean {
		return filterFunctions.every(function (filter) {
			return filter(request);
		});
	};
}

/**
 * Create a filter function from any of the valid filter types
 */
export function createFilter(filter: Filter): FilterFunction {
	if (typeof filter === 'string') {
		return filterStringRoute(filter);
	}
	else if (filter instanceof RegExp) {
		return filterRegexRoute(filter);
	}
	else if (typeof filter === 'function') {
		return <FilterFunction> filter;
	}
	else if (typeof filter === 'object' && filter) {
		return filterObject(<FilterObject> filter);
	}
	else {
		throw new Error('invalid filter');
	}
}

/**
 * create a filter function from a string match
 */
function filterStringRoute(match: string): FilterFunction {
	return function (request: IncomingMessage): boolean {
		// TODO make this more robust
		const url = parseUrl(request.url);
		return url.pathname.indexOf(match) === 0;
	};
}

/**
 * create a filter function from a regular expression
 */
function filterRegexRoute(match: RegExp): FilterFunction {
	return function (request: IncomingMessage): boolean {
		const url = parseUrl(request.url);
		return match.test(url.pathname);
	};
}

/**
 * create a filter function from an object whose keys will be compared against the incoming message
 */
function filterObject(match: FilterObject): FilterFunction {
	return function (request: IncomingMessage): boolean {
		// TODO add deep matching for non-primitives
		for (let key in match) {
			if ((<any> match)[key] !== (<any> request)[key]) {
				return false;
			}
		}

		return true;
	};
}
