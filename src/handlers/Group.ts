import { Handler, Response, HandlerFunction, isHandlerFunction, isHandler } from './Handler';
import { ServerResponse, IncomingMessage } from 'http';
import Functional from './Functional';

/**
 * Directives are used for processing the middleware stack. Their behavior is as follows:
 *
 * void: continue processing the next element as normal
 * skip: skip the remaining middleware in the current group
 * immediate: immediately return the response and skip the rest of the middleware
 */
export type Directive = Response | 'skip' | 'immediate';

export type HandlerDefinition = Handler | HandlerFunction | Array<Handler | HandlerFunction>;

export default class Group implements Handler {
	readonly handlers: Handler[];

	constructor(handlers: HandlerDefinition = []) {
		this.handlers = [];
		this.add(handlers);
	}

	add(handler: HandlerDefinition): this {
		if (Array.isArray(handler)) {
			handler.forEach(this.add.bind(this));
		}
		else if (isHandlerFunction(handler)) {
			this.handlers.push(new Functional(handler));
		}
		else if (isHandler(handler)) {
			this.handlers.push(handler);
		}
		else {
			throw new Error('Unrecognized type');
		}

		return this;
	}

	handle(request: IncomingMessage, response: ServerResponse): Promise<Directive> {
		return this.processHandlers(request, response)
			.then(function (result: any) {
				// Filter all but the immediate return directive; if we didn't then 'skip' would be passed out
				// potentially to a parent Group
				if (result === 'immediate') {
					return 'immediate';
				}
			});
	}

	private async processHandlers(request: IncomingMessage, response: ServerResponse): Promise<Directive> {
		for (let count = 0; count < this.handlers.length; count++) {
			const result = await this.handlers[count].handle(request, response);

			if (result === 'skip' || result === 'immediate') {
				return result;
			}
		}
	}
}
