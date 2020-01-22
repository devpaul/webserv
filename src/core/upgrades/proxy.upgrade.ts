import { UpgradeMiddlewareFactory } from '../interface';
import { log } from '../log';
import Server = require('http-proxy');

export interface ProxyProperties {
	baseUrl: string;
	proxy: Server;
}

/**
 * This connects a local websocket to a proxied websocket
 */
export const proxyUpgrade: UpgradeMiddlewareFactory<ProxyProperties> = ({ baseUrl, proxy }) => {
	return (request, socket, head) => {
		log.debug(`Upgrade request for proxied "${baseUrl}"`);

		socket.on('close', () => {
			log.debug('Socket closed');
		});
		socket.on('connect', () => {
			log.debug('Socket connect');
		});
		proxy.ws(request, socket, head);
	};
};
