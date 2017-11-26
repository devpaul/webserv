import '../polyfills';
import { IncomingMessage, ServerResponse } from 'http';
import { Handler, HandlerFunction, isHandlerFunction } from './Handler';
import Functional from './Functional';

export type ConditionMap = Map<string, Handler>;

export interface Resolver {
	(request: IncomingMessage, map: ConditionMap): Handler | void;
}

export interface Config {
	map: { [ key: string ]: Handler | HandlerFunction };
	resolver: Resolver;
}

/**
 * Resolves a handler via the request's accept header
 */
export function contentNegotiator(request: IncomingMessage, map: Map<string, Handler>) {
	const accept = request.headers.accept || '*/*';
	const values = accept.split(',').map((value: string) => {
		return value.trim();
	});

	for (let value of values) {
		if (map.has(value)) {
			return map.get(value);
		}

		const [ type, subtype ] = value.split('/');
		if (subtype === '*') {
			for (let accept of map.keys()) {
				const [ acceptType ] = accept.split('/');
				if (acceptType === type) {
					return map.get(accept);
				}
			}
		}
	}
}

/**
 * Resolves a handler via a string mapping with the request's header.
 * If a "default" key is defined in the map then it will be returned when no match exists
 */
export function headerResolver(name: string) {
	const resolver: Resolver = function (request: IncomingMessage, map: ConditionMap) {
		const value: any = request.headers[name];

		if (typeof value === 'string' && map.has(value)) {
			return map.get(value);
		}
		if (map.has('default')) {
			return map.get('default');
		}
	};
	return resolver;
}

/**
 * Resolves a handler via the request method.
 * If a "default" key is defined in the map then it will be returned when no match exists
 */
export function methodResolver(request: IncomingMessage, map: ConditionMap) {
	const value = request.method;

	if (map.has(value)) {
		return map.get(value);
	}
	return map.get('default');
}

/**
 * Handle a request based on headers or another condition
 */
export default class Branch implements Handler {
	/**
	 * A map of handlers mapped to a key condition
	 */
	map: ConditionMap;

	/**
	 * Resolves values to a single mapped handler
	 */
	resolver: Resolver;

	constructor(config: Config) {
		const {
			map,
			resolver
		} = config;

		this.map = new Map(Array.from(Object.entries(map).map(([ key, handler ]) => {
			if (isHandlerFunction(handler)) {
				return [ key, new Functional(handler) ];
			}
			return [ key, handler ];
		})));
		this.resolver = resolver;
	}

	handle(request: IncomingMessage, response: ServerResponse) {
		const handler = this.resolver(request, this.map);

		if (handler) {
			return handler.handle(request, response);
		}
	}
}
