import Group, { HandlerDefinition } from '../handlers/Group';
import ServeFile from '../middleware/ServeFile';
import ServeDirectory from '../middleware/ServeDirectory';
import { BasicServer } from '../servers/BasicServer';
import HttpsServer, { HttpsConfig } from '../servers/HttpsServer';
import HttpServer, { HttpConfig } from '../servers/HttpServer';
import WebApplication from '../middleware/WebApplication';
import { ServerOptions as HttpsOptions } from 'https';
import buildCert from './buildCert';
import { Upgradable } from '../handlers/Handler';

export type MiddlewareFunction = () => HandlerDefinition;
export type Middleware = HandlerDefinition | MiddlewareFunction;

export enum ServerType {
	HTTP = 'http',
	HTTPS = 'https'
}

export interface Config {
	directory?: string;
	middleware?: Middleware;
	port?: string | number;
	start?: boolean;
	timeout?: number;
	type?: ServerType;
	httpsOptions?: HttpsOptions;
	upgrade?: Upgradable;
}

const DEFAULT_PORT = 8888;
/**
 * Create a server from configuration
 *
 * @param {Config} config
 * @return {any}
 */
export default async function (config: Config): Promise<BasicServer> {
	const port = config.port ? typeof config.port === 'string' ? parseInt(config.port, 10) : config.port : DEFAULT_PORT;
	const middleware = new WebApplication();
	let server: BasicServer;

	if (!config.type || config.type === ServerType.HTTP) {
		const httpConfig: HttpConfig = {
			port,
			upgradeHandler: config.upgrade
		};

		server = new HttpServer(httpConfig, middleware);
	}
	else if (config.type === ServerType.HTTPS) {
		const httpsConfig: HttpsConfig = Object.assign({
			port
		}, config.httpsOptions || {});

		if (!httpsConfig.key || !httpsConfig.cert) {
			const { certificate, clientKey } = await buildCert();
			httpsConfig.key = clientKey;
			httpsConfig.cert = certificate;
		}

		server = new HttpsServer(httpsConfig, middleware);
	}
	else {
		throw new Error(`Unknown server type "${ config.type }"`);
	}

	if (config.middleware) {
		const middleware: HandlerDefinition = isMiddlewareFunction(config.middleware) ? config.middleware() : config.middleware;
		server.app.middleware.add(middleware);
	}

	if (config.directory) {
		server.app.middleware.add(new Group([
			new ServeFile(config.directory),
			new ServeDirectory(config.directory)
		]));
	}

	if (config.timeout) {
		server.app.timeout = config.timeout;
	}

	return config.start ? server.start().then(() => server) : server;
}

function isMiddlewareFunction(value: any): value is MiddlewareFunction {
	return (typeof value === 'function');
}
