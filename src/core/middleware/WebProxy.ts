import { Handler, HandlerResponse, Upgradable } from '../handlers/Handler';
import { ClientRequest, IncomingMessage, ServerResponse } from 'http';
import { log } from '../log';
import * as HttpProxy from 'http-proxy';
import { ServerOptions } from 'http-proxy';
import { Socket } from 'net';
import { Url } from 'url';

export interface Options extends ServerOptions {
	onProxyRequest?: WebProxy['onProxyRequest'];
	onProxyResponse?: WebProxy['onProxyResponse'];
	onWebsocketRequest?: WebProxy['onWebsocketRequest'];
}

/**
 * Wraps http-proxy to provide support for a forwarding proxy
 */
export default class WebProxy implements Handler, Upgradable {
	baseUrl: string | Url;

	protected options: Options;

	protected proxy: HttpProxy;

	constructor(baseUrl: string | Url, options: Options = {}) {
		this.baseUrl = baseUrl;
		this.options = options;

		if (options.onProxyRequest) {
			this.onProxyRequest = options.onProxyRequest;
		}

		if (options.onProxyResponse) {
			this.onProxyResponse = options.onProxyResponse;
		}

		if (options.onWebsocketRequest) {
			this.onWebsocketRequest = options.onWebsocketRequest;
		}
	}

	/**
	 * Handle error conditions
	 */
	onError(err: Error) {
		log.error(`Proxy failed: ${err.message}`);
	}

	protected onProxyCallback(
		error: Error,
		request: IncomingMessage,
		response: ServerResponse
	): Promise<HandlerResponse> {
		if (error) {
			log.error(error.message);
			return Promise.reject(error);
		}
	}

	/**
	 * Modify the request before proxy data is sent
	 */
	protected onProxyRequest?(
		proxyRequest: ClientRequest,
		request: IncomingMessage,
		response: ServerResponse,
		options: ServerOptions
	): void;

	/**
	 * Modify the response before proxy data is provided to the client
	 */
	protected onProxyResponse?(
		proxyResponse: IncomingMessage,
		request: IncomingMessage,
		response: ServerResponse
	): void;

	onWebsocketRequest?(
		proxyRequest: ClientRequest,
		request: IncomingMessage,
		socket: Socket,
		options: ServerOptions,
		head: any
	): void;

	handle(request: IncomingMessage, response: ServerResponse): Promise<HandlerResponse> {
		if (response.finished) {
			return;
		}

		return new Promise<HandlerResponse>((resolve) => {
			log.debug(`proxying to ${request.url}`);

			const proxy = this.ensureServer();

			proxy.web(request, response, {}, (error, request, result) => {
				resolve(this.onProxyCallback(error, request, result));
			});
		});
	}

	upgrade(request: IncomingMessage, socket: Socket, head: Buffer): void | Promise<void> {
		log.debug(`Upgrade request for proxied "${this.baseUrl}"`);

		socket.on('close', () => {
			log.debug('Socket closed');
		});
		socket.on('connect', () => {
			log.debug('Socket connect');
		});
		const proxy = this.ensureServer();
		proxy.ws(request, socket, head);
	}

	protected ensureServer() {
		if (this.proxy) {
			return this.proxy;
		}

		const options = Object.assign(
			{
				target: this.baseUrl
			},
			this.options
		);

		this.proxy = HttpProxy.createProxyServer(options);

		this.proxy.on('error', (err: Error) => {
			this.onError(err);
		});

		this.proxy.on(
			'proxyRes',
			(proxyResponse: IncomingMessage, request: IncomingMessage, response: ServerResponse) => {
				if (this.onProxyResponse) {
					this.onProxyResponse(proxyResponse, request, response);
				}
			}
		);

		this.proxy.on(
			'proxyReq',
			(
				proxyRequest: ClientRequest,
				request: IncomingMessage,
				response: ServerResponse,
				options: ServerOptions
			) => {
				if (this.onProxyRequest) {
					this.onProxyRequest(proxyRequest, request, response, options);
				}
			}
		);

		this.proxy.on(
			'proxyReqWs',
			(
				proxyRequest: ClientRequest,
				request: IncomingMessage,
				socket: Socket,
				options: ServerOptions,
				head: any
			) => {
				log.debug(`WebSocket request ${head}`);
				if (this.onWebsocketRequest) {
					this.onWebsocketRequest(proxyRequest, request, socket, options, head);
				}
			}
		);

		return this.proxy;
	}
}
