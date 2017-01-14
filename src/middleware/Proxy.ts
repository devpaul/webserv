import { Handler, Response } from '../handlers/Handler';
import { IncomingMessage, ServerResponse } from 'http';
const httpProxy = require('http-proxy');

export default class Proxy implements Handler {
	baseUrl: string;

	constructor(baseUrl: string) {
		this.baseUrl = baseUrl;
	}

	handle(request: IncomingMessage, response: ServerResponse): Promise<Response> {
		return new Promise<Response>((resolve) => {
			if (response.finished) {
				resolve();
				return;
			}

			const proxy = httpProxy.createProxyServer({});
			proxy.on('error', function (err: Error) {
				console.log(err.message);
				resolve();
			});
			response.on('close', function () {
				console.log('closed');
				resolve();
			});
			proxy.on('proxyRes', function () {
			});
			console.log(`proxying to ${ this.baseUrl }${ request.url }`);
			proxy.web(request, response, {
				changeOrigin: true,
				target: this.baseUrl
			});
		});
	}
}
