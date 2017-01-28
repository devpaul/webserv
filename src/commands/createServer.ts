import { Handler } from '../handlers/Handler';
import WebServer from '../WebServer';
import Group from '../handlers/Group';
import ServeFile from '../middleware/ServeFile';
import ServeDirectory from '../middleware/ServeDirectory';

export type Middleware = () => Handler[] | Handler[];

export interface Config {
	port?: string;
	directory?: string;
	middleware?: Middleware;
}

export default function (config: Config) {
	const server = new WebServer({
		port: config.port
	});

	if (config.middleware) {
		const middleware = (typeof config.middleware === 'function') ? config.middleware() : config.middleware;
		for (let handler of middleware) {
			server.app.middleware.add(handler);
		}
	}

	if (config.directory) {
		server.app.middleware.add(new Group([
			new ServeFile(config.directory),
			new ServeDirectory(config.directory)
		]));
	}

	return server;
}
