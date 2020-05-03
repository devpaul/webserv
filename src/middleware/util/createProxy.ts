import { ClientRequest, IncomingMessage, ServerResponse } from 'http';
import { createProxyServer, ServerOptions } from 'http-proxy';
import { Socket } from 'net';
import { log } from '../../core/log';
import Server = require('http-proxy');

export interface CreateProxyOptions extends ServerOptions {
	target: string;
	onError?(err: Error): void;
	onProxyRequest?(
		proxyRequest: ClientRequest,
		request: IncomingMessage,
		response: ServerResponse,
		options: ServerOptions
	): void;
	onProxyResponse?(proxyResponse: IncomingMessage, request: IncomingMessage, response: ServerResponse): void;
	onWebsocketRequest?(
		proxyRequest: ClientRequest,
		request: IncomingMessage,
		socket: Socket,
		options: ServerOptions,
		head: any
	): void;
}

function defaultErrorHandler(err: Error) {
	log.error(`Proxy failed: ${err.message}`);
}

export function createProxy(options: CreateProxyOptions): Server {
	const { onError = defaultErrorHandler, onProxyResponse, onProxyRequest, onWebsocketRequest, ...config } = options;
	const proxy = createProxyServer(config);

	proxy.on('error', onError);

	proxy.on('proxyRes', (proxyResponse: IncomingMessage, request: IncomingMessage, response: ServerResponse) => {
		onProxyResponse && onProxyResponse(proxyResponse, request, response);
	});

	proxy.on(
		'proxyReq',
		(proxyRequest: ClientRequest, request: IncomingMessage, response: ServerResponse, options: ServerOptions) => {
			onProxyRequest && onProxyRequest(proxyRequest, request, response, options);
		}
	);

	proxy.on(
		'proxyReqWs',
		(proxyRequest: ClientRequest, request: IncomingMessage, socket: Socket, options: ServerOptions, head: any) => {
			log.debug(`WebSocket request ${head}`);
			onWebsocketRequest && onWebsocketRequest(proxyRequest, request, socket, options, head);
		}
	);

	return proxy;
}
