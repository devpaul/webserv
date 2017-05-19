import { ServerResponse, IncomingMessage } from 'http';

export type Response = string | void;

export type HandlerFunction = Handler['handle'];

/**
 * A stateful or configurable object that handles responding to a http request
 */
export interface Handler {
	handle(request: IncomingMessage, response: ServerResponse): Promise<Response>;
}

/**
 * Type guard used to identify Handlers
 * @return if the passed value is a Handler
 */
export function isHandler(value: any): value is Handler {
	return !!value && typeof value === 'object' && 'handle' in value;
}

/**
 * Type guard used to identify handler methods
 * @return if the passed value is a handler method
 */
export function isHandlerFunction(value: any): value is HandlerFunction {
	return typeof value === 'function';
}
