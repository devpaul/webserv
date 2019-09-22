import { ServerResponse, IncomingMessage } from 'http';
import { Socket } from 'net';

export type HandlerResponse = string | void;

export type HandlerFunction = Handler['handle'];

/**
 * A stateful or configurable object that handles responding to a http request
 */
export interface Handler {
	handle(request: IncomingMessage, response: ServerResponse): Promise<HandlerResponse> | HandlerResponse;
}

export interface Upgradable {
	upgrade(request: IncomingMessage, socket: Socket, head: Buffer): Promise<void> | void;
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

/**
 * Calls a handler or handler function and returns its result
 */
export function call(
	handler: Handler | HandlerFunction | undefined,
	request: IncomingMessage,
	response: ServerResponse
) {
	if (isHandler(handler)) {
		return handler.handle(request, response);
	} else if (isHandlerFunction(handler)) {
		return handler(request, response);
	}
}
