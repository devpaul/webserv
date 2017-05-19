import { Handler, HandlerFunction } from './Handler';

/**
 * Helper method to wrap a function and treat it as a Handler.
 *
 * This is useful for creating ad-hoc Middleware
 */
export default class Functional implements Handler {
	readonly handle: HandlerFunction;

	constructor(handler: HandlerFunction) {
		this.handle = handler;
	}
}
