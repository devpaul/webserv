import { IncomingMessage, ServerResponse } from 'http';
import { Socket } from 'net';

export const enum ServerType {
	HTTP = 'http',
	HTTPS = 'https'
}

export type HttpMethod = 'connect' | 'delete' | 'get' | 'head' | 'post' | 'put' | 'trace';

export type Process = (request: IncomingMessage, response: ServerResponse) => Promise<void> | void;

export type ProcessFactory<T extends object> = (options: T) => Process;

export type Guard = (request: IncomingMessage) => boolean;

export type GuardFactory<T extends object> = (options: T) => Guard;

export type MiddlewareResult = object | string | void;

/**
 * Middleware handles a single request made to the server.
 *
 * The preferred way to provide a response is by returning a MiddlewareResult from the middleware.
 * This may then be transformed by a Transform to supply a response in an acceptable format.
 */
export type Middleware = (
	request: IncomingMessage,
	response: ServerResponse
) => Promise<MiddlewareResult> | MiddlewareResult;

export type MiddlewareFactory<T extends object = {}> = (options: T) => Middleware;

export type Transform = (result: MiddlewareResult, request: IncomingMessage, response: ServerResponse) => void;

export type TransformFactory<T extends object> = (options: T) => Transform;

export type Upgrader = (request: IncomingMessage, socket: Socket, head: Buffer) => Promise<void> | void;

export type UpgraderFactory<T extends object> = (options: T) => Upgrader;

export interface Route {
	/**
	 * Tests if the IncomingMessage should be handled by this route
	 */
	test(request: IncomingMessage, response: ServerResponse): Promise<boolean> | boolean;
	/**
	 * Seeks a response to provide to ServerResponse
	 */
	run(request: IncomingMessage, response: ServerResponse): Promise<MiddlewareResult> | MiddlewareResult;
}

export interface RouteDescriptor {
	before?: Process[];
	guards?: Guard[];
	middleware: Middleware | Array<Route | RouteDescriptor>;
	transforms?: Transform[];
	after?: Process[];
}
