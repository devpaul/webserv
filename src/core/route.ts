import { IncomingMessage, ServerResponse } from 'http';
import { RouteDescriptor, Route, MiddlewareFactory } from './interface';
import { HttpError, HttpStatus } from './HttpError';

export type RouteFactory = (options: RouteDescriptor) => Route;

export interface MultiRouteProperties {
	routes: Array<RouteDescriptor | Route>;
}

function isRoute(value: any): value is Route {
	return typeof value === 'object' && typeof value.test === 'function' && typeof value.run === 'function';
}

export const multiroute: MiddlewareFactory<MultiRouteProperties> = (props) => {
	const routes = props.routes.map((item) => (isRoute(item) ? item : route(item)));
	return async (request, response) => {
		for (let route of routes) {
			if (await route.test(request, response)) {
				return await route.run(request, response);
			}
		}
		throw new HttpError(HttpStatus.NotFound);
	};
};

export const route: RouteFactory = ({ before = [], guards = [], middleware: action, transforms = [], after = [] }) => {
	const middleware = Array.isArray(action) ? multiroute({ routes: action }) : action;
	async function test(request: IncomingMessage, response: ServerResponse) {
		for (let process of before) {
			await process(request, response);
		}
		return guards.every((guard) => guard(request));
	}

	async function run(request: IncomingMessage, response: ServerResponse) {
		const result = await middleware(request, response);

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
	}

	return {
		test,
		run
	};
};
