import { IncomingMessage, ServerResponse } from 'http';
import { log } from '../log';
import Response from './Response';

/**
 * Middleware to forward a request to a different location using HTTP 301: Moved Permanently
 */
export default class Forwarder extends Response {
	location: string;

	constructor(location: string) {
		super({
			header: { Location: location },
			statusCode: 301
		});
		this.location = location;
	}

	handle(request: IncomingMessage, response: ServerResponse) {
		log.debug(`Forwarding ${ request.url } to ${ this.location }`);
		return super.handle(request, response);
	}
}
