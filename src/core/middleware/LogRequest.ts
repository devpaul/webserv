import { NPMLoggingLevel } from 'winston';
import { Handler, HandlerResponse } from '../handlers/Handler';
import { IncomingMessage } from 'http';
import { log } from '../log';

/**
 * Middleware to log a request to winston. Useful to capture information on incoming requests.
 */
export default class LogRequest implements Handler {
	level: NPMLoggingLevel;

	constructor(level: NPMLoggingLevel = 'info') {
		this.level = level;
	}

	handle(request: IncomingMessage): Promise<HandlerResponse> {
		log[this.level](`[${request.method}] ${request.url}`);
		return Promise.resolve();
	}
}
