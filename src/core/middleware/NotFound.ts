import { IncomingMessage, ServerResponse } from 'http';
import { log } from '../log';
import Response from './Response';

/**
 * Middleware to return a 404 response
 */
export default class NotFound extends Response {
	constructor(message: string = 'Not Found') {
		super({
			message,
			statusCode: 404
		});
	}

	handle(request: IncomingMessage, response: ServerResponse) {
		log.debug(`Not Found: ${request.url}`);
		return super.handle(request, response);
	}
}
