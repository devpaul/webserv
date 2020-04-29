import { ServerOptions } from 'https';
import { App } from '../../core/app';
import { Environment, getLoader } from '../loader';

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
	const loader = getLoader(config.name);
	if (!loader) {
		throw new Error(`Service ${config.name} does not exist`);
	}
	const service = await loader(config, env);
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
