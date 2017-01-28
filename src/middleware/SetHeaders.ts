import { Handler, Response as HandlerResponse } from '../handlers/Handler';
import { IncomingMessage, ServerResponse } from 'http';

export interface Headers {
	[ key: string ]: string;
}

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

export type CacheMethods = 'must-revalidate' | 'no-cache' | 'no-store' | 'no-transform' | 'public' | 'private' |
	'proxy-revalidate' | string;

export function noCache(cacheMethod: CacheMethods = 'no-cache') {
	return new SetHeaders('Cache-Control', cacheMethod);
}

export function corsSupport(origin = '*') {
	return new SetHeaders('Access-Control-Allow-Origin', origin);
}
