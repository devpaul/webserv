import { Handler, HandlerFunction, isHandlerFunction, isHandler } from './Handler';
import Functional from './Functional';
import { proxy as filterProxy, Filter } from './filter';
import { Transform, proxy as transformProxy } from './transform';
import Group from './Group';

export type RouteHandler = Handler | HandlerFunction | Array<Handler | HandlerFunction>;

export class Route {
	protected handler: Handler;

	protected stack: Array<(handler: Handler) => Handler> = [];

	constructor(handler: Handler) {
		this.handler = handler;
	}

	filter(filter: Filter): this {
		this.stack.unshift(function (handler) {
			return filterProxy(handler, filter);
		});
		return this;
	}

	transform(func: Transform): this {
		this.stack.unshift(function (handler) {
			return transformProxy(handler, func);
		});
		return this;
	}

	end(): Handler {
		let handler = this.handler;
		for (let factory of this.stack) {
			handler = factory(handler);
		}
		return handler;
	}
}

export function route(filter: Filter, handler: RouteHandler): Route;
export function route(handler: RouteHandler): Route;
export default function route(filter: Filter | RouteHandler, handler?: RouteHandler): Route {
	if (arguments.length === 1) {
		handler = <RouteHandler> filter;
		filter = null;
	}

	let route: Route;
	if (Array.isArray(handler)) {
		route = new Route(new Group(handler));
	}
	else if (isHandler(handler)) {
		route = new Route(handler);
	}
	else if (isHandlerFunction(handler)) {
		route = new Route(new Functional(handler));
	}
	else {
		throw new Error('Unrecognized type');
	}

	return filter ? route.filter(<Filter> filter) : route;
}
