import { Handler, HandlerFunction, isHandlerFunction } from './Handler';
import Functional from './Functional';
import { proxy as filterProxy, Filter, method } from './filter';
import { Transform, proxy as transformProxy } from './transform';
import Group from './Group';
import * as pathToRegexp from 'path-to-regexp';
import { Key } from 'path-to-regexp';
import { IncomingMessage } from 'http';
import { format, parse } from 'url';
import { overrideWrapper } from '../util/proxies';
import { log } from '../log';

export type RouteHandler = Handler | HandlerFunction | Array<Handler | HandlerFunction>;

export type HttpMethod = 'connect' | 'delete' | 'get' | 'head' | 'post' | 'put' | 'trace';

/**
 * A route is comprised of an number of Filters or Transforms which wraps a Handler
 */
export class Route {
	protected stack: Array<(handler: Handler) => Handler> = [];

	filter(filter: Filter): this {
		this.stack.unshift(function (handler) {
			return filterProxy(handler, filter);
		});
		return this;
	}

	method(name: HttpMethod | string): this {
		return this.filter(method(name));
	}

	transform(func: Transform): this {
		this.stack.unshift(function (handler) {
			return transformProxy(handler, func);
		});
		return this;
	}

	wrap(handler: RouteHandler): Handler {
		if (Array.isArray(handler)) {
			handler = new Group(handler);
		}
		else if (isHandlerFunction(handler)) {
			handler = new Functional(handler);
		}

		for (let factory of this.stack) {
			handler = factory(handler);
		}
		return handler;
	}
}

export interface IncomingRoute extends IncomingMessage {
	params: { [ key: string ]: string | string[] };
}

/**
 * Handles string-based route matching with string parameterization
 *
 * @param route a route helper
 * @param filter the string based match
 * @return {Route} the passed route helper with filters and transforms
 */
function stringRoute(route: Route, filter: string) {
	const keys: Key[] = [];
	const regex = pathToRegexp(filter, keys);
	log.info(`Created regexp ${ regex } to match ${ filter }`);
	log.debug('route keys', keys);
	const routeMatch = Symbol();

	return route.transform((request: IncomingMessage) => {
		const url = parse(request.url);
		const match = regex.exec(url.pathname);

		if (!match) {
			return request;
		}

		return overrideWrapper(request, {
			[routeMatch]: match
		});
	}).filter((request: IncomingMessage) => {
		return !!(<any> request)[routeMatch];
	}).transform((request: IncomingMessage) => {
		const params: any = {};
		const matches = (<any> request)[routeMatch];

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

		// add relative mapping transform if last key is .* or '/' if no keys
		const originalUrl = request.url;
		const url = parse(request.url);
		if (keys.length === 0) {
			url.pathname = '/';
		}
		else if (keys[keys.length - 1].pattern === '.*') {
			url.pathname = matches[matches.length - 1] || '/';
		}

		return overrideWrapper(request, {
			originalUrl,
			params,
			url: format(url)
		});
	});
}

/**
 * A helper function used for defining a route
 * @param filter an optional filter that must be matched for the wrapped handler to be called
 * @return a new Route which must wrap a Handler
 */
export default function route(filter?: Filter): Route {
	const route = new Route();

	if (typeof filter === 'string') {
		stringRoute(route, filter);
	}
	else if (filter) {
		route.filter(filter);
	}

	return route;
}
