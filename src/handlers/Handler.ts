import { ServerResponse, IncomingMessage } from 'http';

export type Response = string | void;

export type HandlerFunction = Handler['handle'];

export interface Handler {
	handle(request: IncomingMessage, response: ServerResponse): Promise<Response>;
}

export function isHandler(value: any): value is Handler {
	return !!value && typeof value === 'object' && 'handle' in value;
}

export function isHandlerFunction(value: any): value is HandlerFunction {
	return typeof value === 'function';
}
