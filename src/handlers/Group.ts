import { Handler, Response, HandlerFunction } from './Handler';
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

export default class Group implements Handler {
	readonly name: string;

	readonly handlers: Handler[];

	constructor(handlers: Handler[] = [], name: string = 'group') {
		this.name = name;
		this.handlers = handlers;
	}

	add(handler: Handler | HandlerFunction) {
		if (typeof handler === 'function') {
			handler = new Functional(<HandlerFunction> handler);
		}

		this.handlers.push(<Handler> handler);
	}

	handle(request: IncomingMessage, response: ServerResponse): Promise<Directive> {
		return Promise.race([
			this.promiseDirty(),
			this.processHandlers(request, response)
		]).then(function (result: any) {
			// Filter all but the immediate return directive; if we didn't then 'skip' would be passed out
			// potentially to a parent Group
			if (result === 'immediate') {
				return 'immediate';
			}
		})
	}

	private promiseDirty() {
		return new Promise(() => {
			// TODO observe this.handlers and if changed during handling error w/ 500
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
