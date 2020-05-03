import { IncomingMessage, ServerResponse } from 'http';
import Server from 'http-proxy';
import { HandlerFactory } from '../../core/interface';
import { log } from '../../core/log';
import { createProxy } from '../util/createProxy';

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

export const proxy: HandlerFactory<ProxyProperties> = ({ proxy, baseUrl, onProxyCallback = defaultProxyCallback }) => {
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
