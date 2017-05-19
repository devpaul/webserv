import { Response as HandlerResponse } from '../handlers/Handler';
import { IncomingMessage, ServerResponse } from 'http';
import { log } from '../log';
import Response from './Response';

/**
 * Middleware to return a 404 response
 */
export default class NotFound extends Response {
	constructor(message: string = 'Not Found') {
		super(404, null, message);
	}

	handle(request: IncomingMessage, response: ServerResponse): Promise<HandlerResponse> {
		log.debug(`Not Found: ${ request.url }`);
		return super.handle(request, response);
	}
}
