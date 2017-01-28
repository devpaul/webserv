import { NPMLoggingLevel } from 'winston';
import { Handler, Response } from '../handlers/Handler';
import { IncomingMessage } from 'http';
import { log } from '../log';

export default class LogRequest implements Handler {
	level: NPMLoggingLevel;

	constructor(level: NPMLoggingLevel = 'info') {
		this.level = level;
	}

	handle(request: IncomingMessage): Promise<Response> {
		log[this.level](`[${ request.method }] ${ request.url }`);
		return Promise.resolve();
	}
}
