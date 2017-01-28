import { Handler, Response } from '../handlers/Handler';
import { IncomingMessage, ServerResponse } from 'http';
import { log } from '../log';
const httpProxy = require('http-proxy');

export default class Proxy implements Handler {
	baseUrl: string;

	constructor(baseUrl: string) {
		this.baseUrl = baseUrl;
	}

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
			proxy.on('error', function (err: Error) {
				log.error(`Proxy failed: ${ err.message }`);
				resolve();
			});
			response.on('close', function () {
				console.log('closed');
				resolve();
			});
			proxy.on('proxyRes', function () {
			});

			log.debug(`proxying to ${ this.baseUrl }${ request.url }`);

			proxy.web(request, response, {
				changeOrigin: true,
				target: this.baseUrl
			});
		});
	}
}
