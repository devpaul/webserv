import Group, { HandlerDefinition } from '../core/handlers/Group';
import { BasicServer } from '../core/servers/BasicServer';
import HttpsServer, { HttpsConfig } from '../core/servers/HttpsServer';
import HttpServer, { HttpConfig } from '../core/servers/HttpServer';
import WebApplication from '../core/middleware/WebApplication';
import { ServerOptions as HttpsOptions } from 'https';
import buildCert from '../core/commands/buildCert';
import { Upgradable } from '../core/handlers/Handler';
import { setLogLevel } from '../core/log';
import ServePath from '../core/middleware/ServePath';
import { ServerType } from 'src/core/interface';

export type MiddlewareFunction = () => HandlerDefinition;
export type Middleware = HandlerDefinition | MiddlewareFunction;

export interface Config {
	debugLevel?: string;
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
export default async function(config: Config): Promise<BasicServer> {
	const port = config.port
		? typeof config.port === 'string'
			? parseInt(config.port, 10)
			: config.port
		: DEFAULT_PORT;
	const middleware = new WebApplication();
	let server: BasicServer;

	if (config.debugLevel) {
		setLogLevel(config.debugLevel);
	}

	if (!config.type || config.type === ServerType.HTTP) {
		const httpConfig: HttpConfig = {
			port,
			upgradeHandler: config.upgrade
		};

		server = new HttpServer(httpConfig, middleware);
	} else if (config.type === ServerType.HTTPS) {
		const httpsConfig: HttpsConfig = Object.assign(
			{
				port
			},
			config.httpsOptions || {}
		);

		if (!httpsConfig.key || !httpsConfig.cert) {
			const { certificate, clientKey } = await buildCert();
			httpsConfig.key = clientKey;
			httpsConfig.cert = certificate;
		}

		server = new HttpsServer(httpsConfig, middleware);
	} else {
		throw new Error(`Unknown server type "${config.type}"`);
	}

	if (config.middleware) {
		const middleware: HandlerDefinition = isMiddlewareFunction(config.middleware)
			? config.middleware()
			: config.middleware;
		server.app.middleware.add(middleware);
	}

	if (config.directory) {
		server.app.middleware.add(
			new Group([
				new ServePath({
					basePath: config.directory
				})
			])
		);
	}

	if (config.timeout) {
		server.app.timeout = config.timeout;
	}

	return config.start ? server.start().then(() => server) : server;
}

function isMiddlewareFunction(value: any): value is MiddlewareFunction {
	return typeof value === 'function';
}
