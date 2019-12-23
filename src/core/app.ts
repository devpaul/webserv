import { ServerResponse } from 'http';

import { isHttpError } from './HttpError';
import { Guard, Process, Route, RouteDescriptor, Transform, Upgrade, UpgradeDescriptor } from './interface';
import { log } from './log';
import { route as createRoute } from './routes/route';
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
	route?: RouteDescriptor;
	upgrade?: UpgradeDescriptor;
}

export class App {
	readonly before: Process[] = [];
	readonly guards: Guard[] = [];
	readonly routes: Route[] = [];
	readonly transforms: Transform[] = [];
	readonly after: Process[] = [];
	readonly upgrades: Upgrade[] = [];

	protected controls?: Promise<ServerControls>;

	addService({ route, upgrade }: Service) {
		if (route) {
			this.routes.push(createRoute(route));
		}
		if (upgrade) {
			this.upgrades.push(createUpgrade(upgrade));
		}
	}

	start(type: 'https', config: HttpsConfig): Promise<ServerControls>;
	start(type: 'http', config: HttpConfig): Promise<ServerControls>;
	start(type: 'http' | 'https', config: HttpsConfig | HttpConfig): Promise<ServerControls>;
	start(type: 'http' | 'https', config: HttpsConfig | HttpConfig): Promise<ServerControls> {
		if (this.controls) {
			throw new Error('server already started');
		}
		const globalRoute = createRoute({
			before: this.before,
			guards: this.guards,
			middleware: this.routes,
			transforms: this.transforms,
			after: this.after
		});
		const onRequest = createRequestHandler(globalRoute, (e, response) => {
			if (isHttpError(e)) {
				response.statusCode = e.statusCode;
				response.end();
			} else {
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
