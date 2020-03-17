import { ServerResponse } from 'http';
import { isHttpError } from './HttpError';
import { Route, RouteDescriptor, Upgrade, UpgradeDescriptor } from './interface';
import { log } from './log';
import { route as createRoute } from './route';
import { StartHttpConfig, startHttpServer } from './servers/createHttpServer';
import { StartHttpsConfig, startHttpsServer } from './servers/createHttpsServer';
import { createRequestHandler } from './servers/createRequestHandler';
import { createUpgradeHandler } from './servers/createUpgradeHandler';
import { ServerControls } from './servers/startServer';
import { upgrade as createUpgrade } from './upgrades/upgrade';

export type ErrorRequestHandler = (error: any, response: ServerResponse) => void;

export type HttpConfig = Omit<StartHttpConfig, 'onRequest' | 'onUpgrade'>;
export type HttpsConfig = Omit<StartHttpsConfig, 'onRequest' | 'onUpgrade'>;

export interface Service {
	global?: Omit<RouteDescriptor, 'middleware'>;
	route?: RouteDescriptor;
	upgrade?: UpgradeDescriptor;
}

export type GlobalRoute = RouteDescriptor & { middleware: Route[] };

export class App {
	readonly globalRoute: GlobalRoute = {
		before: [],
		guards: [],
		middleware: [],
		transforms: [],
		after: []
	};
	readonly upgrades: Upgrade[] = [];

	protected controls?: Promise<ServerControls>;

	add(services: Service | Service[]) {
		if (Array.isArray(services)) {
			for (let service of services) {
				this.addService(service);
			}
		} else {
			this.addService(services);
		}
	}

	protected addService({ route, upgrade, global }: Service) {
		if (route) {
			this.globalRoute.middleware.push(createRoute(route));
		}
		if (upgrade) {
			this.upgrades.push(createUpgrade(upgrade));
		}
		if (global) {
			if (global.after) {
				this.globalRoute.after.push(...global.after);
			}
			if (global.before) {
				this.globalRoute.before.push(...global.before);
			}
			if (global.guards) {
				this.globalRoute.guards.push(...global.guards);
			}
			if (global.transforms) {
				this.globalRoute.transforms.push(...global.transforms);
			}
		}
	}

	start(type: 'https', config: HttpsConfig): Promise<ServerControls>;
	start(type: 'http', config: HttpConfig): Promise<ServerControls>;
	start(type: 'http' | 'https', config: HttpsConfig | HttpConfig): Promise<ServerControls>;
	start(type: 'http' | 'https', config: HttpsConfig | HttpConfig): Promise<ServerControls> {
		if (this.controls) {
			throw new Error('server already started');
		}
		const globalRoute = createRoute(this.globalRoute);
		const onRequest = createRequestHandler(globalRoute, (e, response) => {
			if (isHttpError(e)) {
				log.info(`HTTPError: ${e.statusCode}${e.message ? `. Reason "${e.message}"` : ''}`);
				response.statusCode = e.statusCode;
				response.end();
			} else {
				log.info('General error. ' + e.message);
				throw e;
			}
		});
		const globalUpgrader = createUpgrade({ upgrade: this.upgrades });
		const onUpgrade = createUpgradeHandler(globalUpgrader);

		if (type === 'http') {
			this.controls = startHttpServer({
				...config,
				onRequest,
				onUpgrade
			});
		} else if (type === 'https') {
			this.controls = startHttpsServer({
				...config,
				onRequest,
				onUpgrade
			});
		} else {
			log.error(`Unknown server type: ${type}`);
		}

		if (this.controls) {
			this.controls.then((controls) => {
				log.info(`Server started on ${config.port}`);
				controls.closed.then(() => {
					log.debug('Server stopped');
				});
			});
		}

		return this.controls;
	}
}
