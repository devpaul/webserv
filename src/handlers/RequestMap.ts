import { IncomingMessage, ServerResponse } from 'http';
import { HandlerFunction } from './Handler';
import { Handler, HandlerResponse } from './Handler';

export type ConditionMap = Map<string, HandlerFunction>;

export interface RequestMapper {
	(request: IncomingMessage): string[];
}

export interface Resolver {
	(values: string[], map: ConditionMap): HandlerFunction;
}

export interface Config {
	defaultHandler?: HandlerFunction;
	map: ConditionMap;
	mapper: RequestMapper;
	resolver?: Resolver;
}

function defaultResolver(values: string[], map: ConditionMap): HandlerFunction {
	for (let value of values) {
		if (map.has(value)) {
			return map.get(value);
		}
	}
}

/**
 * Map request data to a collection of handlers
 */
export default class RequestMap implements Handler {
	/**
	 * A default handler in case a defined case cannot be found
	 */
	defaultHandler?: HandlerFunction;

	/**
	 * A map of handlers
	 */
	map: ConditionMap;

	/**
	 * Maps the request to a collection of keys/hashes that can be used by the resolver to find an
	 * appropriate handler to handle the request
	 */
	mapper: RequestMapper;

	/**
	 * Resolves values to a single mapped handler
	 */
	resolver: Resolver;

	constructor(config: Config) {
		this.defaultHandler = config.defaultHandler;
		this.map = config.map;
		this.mapper = config.mapper;
		this.resolver = config.resolver || defaultResolver;
	}

	handle(request: IncomingMessage, response: ServerResponse): Promise<HandlerResponse> | HandlerResponse {
		const values = this.mapper(request);
		const handler = this.resolver(values, this.map) || this.defaultHandler;

		if (handler) {
			return handler(request, response);
		}
	}
}
