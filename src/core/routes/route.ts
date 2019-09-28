import { Process, Middleware, Transform, Guard } from "../interface";
import { IncomingMessage, ServerResponse } from "http";
import { subroute } from "../middleware/subroute";

export interface RouteProperties {
	before?: Process[];
	guards?: Guard[];
	middleware: Middleware | Route[];
	transforms?: Transform[];
	after?: Process[];
}

export interface Route {
	test(request: IncomingMessage, response: ServerResponse): Promise<boolean> | boolean;
	run(request: IncomingMessage, response: ServerResponse): Promise<void> | void;
}

export type RouteFactory = (options: RouteProperties) => Route;

export const route: RouteFactory = ({ before = [], guards = [], middleware: action, transforms = [], after = []}) => {
	const middleware = Array.isArray(action) ? subroute({ routes: action }) : action;
	function test(request: IncomingMessage, response: ServerResponse) {
		for (let process of before) {
			process(request, response);
		}
		return guards.every(guard => guard(request));
	}

	function run(request: IncomingMessage, response: ServerResponse) {
		const result = middleware(request, response);
		for (let transform of transforms) {
			if (response.finished) {
				break;
			}
			transform(result, request, response);
		}
		for (let process of after) {
			process(request, response);
		}
	}

	return {
		test,
		run
	}
}
