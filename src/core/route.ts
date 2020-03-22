import { IncomingMessage, ServerResponse } from 'http';
import { HttpError, HttpStatus } from './HttpError';
import { Middleware, MiddlewareResult, Route, RouteDescriptor } from './interface';

export type RouteFactory = (options: RouteDescriptor) => Route;

export interface MultiRouteProperties {
	routes: Array<RouteDescriptor | Route>;
}

export function isRoute(value: any): value is Route {
	return typeof value === 'object' && typeof value.test === 'function' && typeof value.run === 'function';
}

export const route: RouteFactory = ({
	before = [],
	guards = [],
	middleware: action,
	transforms = [],
	after = [],
	errorHandler
}) => {
	const middleware = Array.isArray(action) ? multiroute(action) : action;
	async function test(request: IncomingMessage, response: ServerResponse) {
		try {
			for (let process of before) {
				await process(request, response);
			}
			return guards.every((guard) => guard(request));
		} catch (e) {
			if (errorHandler) {
				errorHandler(e, response);
				return false;
			}
			throw e;
		}
	}

	async function run(request: IncomingMessage, response: ServerResponse) {
		let result: MiddlewareResult;
		try {
			result = await middleware(request, response);

			for (let transform of transforms) {
				if (response.finished) {
					break;
				}
				transform(result, request, response);
			}
			for (let process of after) {
				await process(request, response);
			}

			return result;
		} catch (e) {
			if (errorHandler) {
				errorHandler(e, response, result);
			} else {
				throw e;
			}
		}
	}

	return {
		test,
		run
	};
};

export const multiroute = (list: Array<RouteDescriptor | Route>): Middleware => {
	const routes = list.map((item) => (isRoute(item) ? item : route(item)));

	const middleware: Middleware = async (request, response) => {
		for (let route of routes) {
			if (await route.test(request, response)) {
				return await route.run(request, response);
			}
		}
		throw new HttpError(HttpStatus.NotFound);
	};

	return middleware;
};
