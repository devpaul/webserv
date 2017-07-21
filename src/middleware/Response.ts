import { Handler, HandlerResponse } from '../handlers/Handler';
import { IncomingMessage, ServerResponse } from 'http';

/**
 * Middleware to return a http response
 */
export default class Response implements Handler {
	statusCode: number;

	header: any;

	message: string | Buffer;

	constructor(statusCode: number = 200, header: any = {}, message: string | Buffer = null) {
		this.statusCode = statusCode;
		this.header = header;
		this.message = message;
	}

	handle(_request: IncomingMessage, response: ServerResponse): Promise<HandlerResponse> {
		response.writeHead(this.statusCode, this.header);
		response.end(this.message);
		return Promise.resolve();
	}
}
