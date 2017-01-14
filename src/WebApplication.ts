import { Handler, Response } from './handlers/Handler';
import { ServerResponse, IncomingMessage } from 'http';
import Group from './handlers/Group';
import MiddlewareError from './MiddlewareError';

export interface Options {
	timeout?: WebApplication["timeout"];
	errorHandler?: WebApplication["errorHandler"];
}

const DEFAULT_TIMEOUT = 1000;

/**
 * A WebApplication is typically the root handler for the server. It manages the middleware.
 */
export class Application<T extends Handler> implements Handler {
	middleware: T;

	timeout: number;

	constructor(middleware: T, options: Options = {}) {
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

	protected postProcessing(_request: IncomingMessage, response: ServerResponse) {
		if (!response.finished) {
			throw new MiddlewareError('Not Found', 404);
		}
	}

	protected errorHandler(_request: IncomingMessage, response: ServerResponse, error: Error): Promise<string> {
		return new Promise((resolve) => {
			const message = this.statusResponse(response.statusCode, error);
			response.statusCode = (<MiddlewareError> error).statusCode || 500;
			response.end(message, resolve);
		});
	}

	protected statusResponse(_code: number, error: Error) {
		// override to provide custom error messages
		return error.message;
	}

	protected promiseTimeout(timeout: number = this.timeout): Promise<void> {
		return new Promise<void>(function (_resolve, reject) {
			setTimeout(function () {
				reject(new MiddlewareError(`Response timeout of ${ timeout } reached.`));
			}, timeout);
		});
	}
}

export default class WebApplication extends Application<Group> {
	constructor(options: Options = {}) {
		super(new Group(), options);
	}
}
