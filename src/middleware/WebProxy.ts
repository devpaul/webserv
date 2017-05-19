import { Handler, Response } from '../handlers/Handler';
import { IncomingMessage, ServerResponse } from 'http';
import { log } from '../log';
const httpProxy = require('http-proxy');

/**
 * Wraps http-proxy to provide support for a forwarding proxy
 */
export default class WebProxy implements Handler {
	baseUrl: string;

	constructor(baseUrl: string) {
		this.baseUrl = baseUrl;
	}

	onClose() {
		log.debug('closed proxy');
	}

	onError(err: Error) {
		log.error(`Proxy failed: ${ err.message }`);
	}

	onProxyRequest?(proxyRequest: IncomingMessage, request: IncomingMessage, response: ServerResponse): void;

	onProxyResponse?(proxyResponse: ServerResponse, request: IncomingMessage, response: ServerResponse): void;

	handle(request: IncomingMessage, response: ServerResponse): Promise<Response> {
		if (response.finished) {
			return Promise.resolve();
		}

		return new Promise<Response>((resolve) => {
			if (response.finished) {
				resolve();
				return;
			}

			const proxy = httpProxy.createProxyServer({});
			proxy.on('error', (err: Error) => {
				this.onError(err);
				resolve();
			});
			response.on('close', () => {
				this.onClose();
				resolve();
			});
			proxy.on('proxyRes', (proxyResponse: ServerResponse, request: IncomingMessage, response: ServerResponse) => {
				if (this.onProxyResponse) {
					this.onProxyResponse(proxyResponse, request, response);
				}
			});
			proxy.on('proxyReq', (proxyRequest: IncomingMessage, request: IncomingMessage, response: ServerResponse) => {
				if (this.onProxyRequest) {
					this.onProxyRequest(proxyRequest, request, response);
				}
			});

			log.debug(`proxying to ${ this.baseUrl }${ request.url }`);

			proxy.web(request, response, {
				changeOrigin: true,
				target: this.baseUrl
			});
		});
	}
}
