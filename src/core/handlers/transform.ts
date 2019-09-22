import { Handler, HandlerFunction, HandlerResponse } from './Handler';
import { IncomingMessage, ServerResponse } from 'http';
import { overrideWrapper } from '../util/proxies';

export interface Transform {
	(request: IncomingMessage): IncomingMessage;
}

/**
 * Transform the incoming request to include additional
 *
 * @param handler the handler to receive transformed data
 * @param transform the transform to apply to the request
 * @return {(request:IncomingMessage, response:ServerResponse)=>Promise<Response>} a transform function
 */
export function transform(handler: HandlerFunction, transform: Transform): HandlerFunction {
	return function(request: IncomingMessage, response: ServerResponse): Promise<HandlerResponse> | HandlerResponse {
		request = transform(request);
		return handler(request, response);
	};
}

/**
 * Wrap a proxy around a handler that transforms data to the handler
 *
 * @param handler the Handler to be proxied
 * @param transformFunc the transform method that transforms the request
 * @return {Handler} a proxied version of the Handler
 */
export function proxy(handler: Handler, transformFunc: Transform): Handler {
	return overrideWrapper(handler, {
		handle: transform(handler.handle.bind(handler), transformFunc)
	});
}
