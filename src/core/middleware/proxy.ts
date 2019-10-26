import { MiddlewareFactory } from '../interface';
import { createProxy } from '../util/createProxy';
import * as Server from 'http-proxy';
import { log } from '../log';
import { IncomingMessage, ServerResponse } from 'http';

export interface ProxyProperties {
	baseUrl: string;
	proxy?: Server;
	onProxyCallback?(error: Error, request: IncomingMessage, response: ServerResponse): Promise<void>;
}

function defaultProxyCallback(error: Error) {
	if (error) {
		log.error(error.message);
		return Promise.reject(error);
	}
}

export const proxy: MiddlewareFactory<ProxyProperties> = ({
	proxy,
	baseUrl,
	onProxyCallback = defaultProxyCallback
}) => {
	proxy = proxy || createProxy({ target: baseUrl });

	return (request, response) => {
		if (response.finished) {
			return;
		}

		return new Promise((resolve) => {
			log.debug(`proxying to ${request.url}`);

			proxy.web(request, response, {}, (error, request, result) => {
				resolve(onProxyCallback(error, request, result));
			});
		});
	};
};
