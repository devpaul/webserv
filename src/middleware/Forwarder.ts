import { Response as HandlerResponse } from '../handlers/Handler';
import { IncomingMessage, ServerResponse } from 'http';
import { log } from '../log';
import Response from './Response';

export default class Forwarder extends Response {
	location: string;

	constructor(location: string) {
		super(301, { 'Location': location });
		this.location = location;
	}

	handle(request: IncomingMessage, response: ServerResponse): Promise<HandlerResponse> {
		log.debug(`Forwarding ${ request.url } to ${ this.location }`);
		return super.handle(request, response);
	}
}
