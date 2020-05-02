import { ServerOptions } from 'https';
import { App } from '../../core/app';
import { getServiceInjector } from '../factories/loader';
import { Environment } from '../interfaces';
import { $Env } from './environment';

export interface Server {
	httpsOptions?: ServerOptions;
	name?: string;
	port?: number;
	services: ServiceConfig[];
	type?: 'http' | 'https';
}

export interface ServiceConfig {
	name: string;
	[key: string]: any;
}

async function bootService(app: App, config: ServiceConfig, env: Environment) {
	const injector = getServiceInjector();
	const factory = injector.get(config.name);
	if (!factory) {
		throw new Error(`Service ${config.name} does not exist`);
	}
	const service = await factory({ ...config, [$Env]: env });
	app.add(service);
}

export async function startServer(
	app: App,
	{ type = 'http', port = 8888, httpsOptions }: Omit<Server, 'services'> = {}
) {
	const controls = await app.start(type, {
		port,
		httpsOptions
	});

	return controls;
}

export async function bootServer(server: Server, env: Environment, app = new App()) {
	for (let service of server.services) {
		await bootService(app, service, env);
	}
	return await startServer(app, server);
}
