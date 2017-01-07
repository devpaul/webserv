import { ServerResponse, IncomingMessage } from 'http';

export type Response = string | void;

export interface HandlerFunction {
	(request: IncomingMessage, response: ServerResponse): Promise<Response>
}

export interface Handler {
	handle(request: IncomingMessage, response: ServerResponse): Promise<Response>;
}
