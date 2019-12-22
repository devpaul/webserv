import { IncomingMessage, ServerResponse } from 'http';

import { subroute } from '../middleware/subroute';
import { RouteDescriptor, Route, Middleware } from '../interface';

export type RouteFactory = (options: RouteDescriptor) => Route;

function isRoute(value: any): value is Route {
	return typeof value === 'object' && typeof value.test === 'function' && typeof value.run === 'function';
}

function createMiddleware(descriptors: RouteDescriptor['middleware']): Middleware {
	if (!Array.isArray(descriptors)) {
		return descriptors;
	}

	const routes: Route[] = descriptors.map((descriptor) => (isRoute(descriptor) ? descriptor : route(descriptor)));
	return subroute({ routes });
}

export const route: RouteFactory = ({ before = [], guards = [], middleware: action, transforms = [], after = [] }) => {
	const middleware = createMiddleware(action);
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
