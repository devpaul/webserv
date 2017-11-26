import { Handler } from '../handlers/Handler';
import { IncomingMessage, ServerResponse } from 'http';

export interface Config {
	header?: Response['header'];
	message?: Response['message'];
	statusCode?: Response['statusCode'];
}

/**
 * Middleware to return a http response
 */
export default class Response implements Handler {
	header: object;

	message?: string | Buffer;

	statusCode: number;

	constructor(config: Config) {
		this.header = config.header || {};
		this.message = config.message;
		this.statusCode = config.statusCode || 200;
	}

	handle(_request: IncomingMessage, response: ServerResponse) {
		response.writeHead(this.statusCode, this.header);
		response.end(this.message);
	}
}
