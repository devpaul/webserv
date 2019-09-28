import { createServer, RequestListener } from 'http';

import { ServerConfig, startServer } from './startServer';

export interface HttpConfig {
	timeout?: number;
	onRequest: RequestListener;
}

export function createHttpServer(config: HttpConfig) {
	return () => {
		const server = createServer(config.onRequest);
		config.timeout && server.setTimeout(config.timeout);
		return Promise.resolve(server);
	}
}

export type StartHttpConfig = Omit<ServerConfig, 'createServer'> & HttpConfig;

export function startHttpServer(config: StartHttpConfig) {
	return startServer({
		... config,
		createServer: createHttpServer(config)
	});
}
