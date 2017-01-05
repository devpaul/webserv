import { Handler, HandlerFunction } from './Handler';

export default class Functional implements Handler {
	readonly name: string;

	readonly handle: HandlerFunction;

	constructor(handler: HandlerFunction, name: string = '') {
		this.handle = handler;
		this.name = name;
	}
}
