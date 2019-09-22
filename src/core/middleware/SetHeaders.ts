import { Handler, HandlerResponse } from '../handlers/Handler';
import { IncomingMessage, ServerResponse } from 'http';

export interface Headers {
	[ key: string ]: string;
}

/**
 * Sets http headers on the http response
 */
export default class SetHeaders implements Handler {
	headers: Headers;

	constructor(header: Headers);
	constructor(header: string, value: string);
	constructor(header: Headers | string, value?: string) {
		if (typeof header === 'string') {
			this.headers = {
				[header]: value
			};
		}
		else {
			this.headers = header;
		}
	}

	handle(_request: IncomingMessage, response: ServerResponse): Promise<HandlerResponse> {
		for (let name in this.headers) {
			response.setHeader(name, this.headers[name]);
		}
		return Promise.resolve();
	}
}

/**
 * http Cache-Control methods
 */
export type CacheMethods = 'must-revalidate' | 'no-cache' | 'no-store' | 'no-transform' | 'public' | 'private' |
	'proxy-revalidate' | string;

/**
 * @param cacheMethod the type of Cache-Control to set on the http response
 * @return a middleware to set the Cache-Control
 */
export function noCache(cacheMethod: CacheMethods = 'no-cache') {
	return new SetHeaders('Cache-Control', cacheMethod);
}

/**
 * @param origin set the origin values for a basic CORS response
 * @return a middleware for returning a CORS response
 */
export function corsSupport(origin = '*') {
	return new SetHeaders('Access-Control-Allow-Origin', origin);
}
