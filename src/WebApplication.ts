import { Handler, Response } from './handlers/Handler';
import { ServerResponse, IncomingMessage } from 'http';
import Group from './handlers/Group';
import MiddlewareError from './MiddlewareError';

export interface Options {
	name?: WebApplication["name"];
	timeout?: WebApplication["timeout"];
	errorHandler?: WebApplication["errorHandler"];
}

const DEFAULT_NAME = 'application';
const DEFAULT_MIDDLEWARE_NAME = `${ DEFAULT_NAME } middleware`;
const DEFAULT_TIMEOUT = 1000;

/**
 * A WebApplication is typically the root handler for the server. It manages the middleware.
 */
export default class WebApplication implements Handler {
	readonly name: string;

	middleware: Handler;

	timeout: number;

	constructor(middleware: Handler = new Group([], DEFAULT_MIDDLEWARE_NAME), options: Options = {}) {
		this.name = options.name || DEFAULT_NAME;

		this.middleware = middleware;
		this.timeout = options.timeout || DEFAULT_TIMEOUT;

		if (options.errorHandler) {
			this.errorHandler = options.errorHandler;
		}
	}

	handle(request: IncomingMessage, response: ServerResponse): Promise<Response> {
		return Promise.race([
			this.promiseTimeout(),
			this.middleware.handle(request, response)
		]).then(() => {
			return this.postProcessing(request, response);
		}).catch((error: Error) => {
			// Send our errors to the error handler
			return this.errorHandler(request, response, error);
		});
	}

	postProcessing(_request: IncomingMessage, response: ServerResponse) {
		if (!response.finished) {
			response.end();
		}
	}

	errorHandler(_request: IncomingMessage, response: ServerResponse, error: Error): Promise<string> {
		return new Promise(function (resolve) {
			response.statusCode = (<MiddlewareError> error).statusCode || 500;
			response.end(error.message, resolve);
		});
	}

	private promiseTimeout(timeout: number = this.timeout): Promise<void> {
		return new Promise<void>(function (_resolve, reject) {
			setTimeout(function () {
				reject(new MiddlewareError(`Response timeout of ${ timeout } reached.`));
			}, timeout);
		});
	}
}
