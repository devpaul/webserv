import { Handler, HandlerFunction } from './Handler';

export default class Functional implements Handler {
	readonly handle: HandlerFunction;

	constructor(handler: HandlerFunction) {
		this.handle = handler;
	}
}
