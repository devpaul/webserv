import { RequestListener, ServerResponse } from 'http';

import { isHttpError } from './HttpError';
import { Guard, Process, Transform, Upgrader } from './interface';
import { log } from './log';
import { Route, route } from './routes/route';
import { StartHttpConfig, startHttpServer } from './servers/createHttpServer';
import { StartHttpsConfig, startHttpsServer } from './servers/createHttpsServer';
import { ServerControls } from './servers/startServer';

export type ErrorRequestHandler = (error: any, response: ServerResponse) => void;

export function createRequestHandler(route: Route, errorHandler?: ErrorRequestHandler): RequestListener {
	return async (request, response) => {
		try {
			if (await route.test(request, response)) {
				await route.run(request, response);
			}
		}
		catch (e) {
			if (errorHandler) {
				errorHandler(e, response);
			}
			else {
				throw e;
			}
		}
	}
}

export type HttpConfig = Omit<StartHttpConfig, 'onRequest' | 'onUpgrade'>;
export type HttpsConfig = Omit<StartHttpsConfig, 'onRequest' | 'onUpgrade'>

export class App {
	readonly before: Process[] = [];
	readonly guards: Guard[] = [];
	readonly routes: Route[] = [];
	readonly transforms: Transform[] = [];
	readonly after: Process[] = [];
	upgrader: Upgrader;

	protected controls?: Promise<ServerControls>;

	start(type: 'https', config: HttpsConfig): void;
	start(type: 'http', config: HttpConfig): void;
	start(type: 'http' | 'https', config: HttpsConfig | HttpConfig) {
		if (this.controls) {
			throw new Error('server already started');
		}
		const globalRoute = route({
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
			}
			else {
				throw e;
			}
		});
		const onUpgrade: Upgrader = (request, socket, head) => {
			if (this.upgrader) {
				this.upgrader(request, socket, head);
			}
		}
		if (type === 'http') {
			this.controls = startHttpServer({
				... config,
				onRequest,
				onUpgrade
			});
		}
		else if (type === 'https') {
			this.controls = startHttpsServer({
				... config,
				onRequest,
				onUpgrade
			});
		}
		else {
			log.error(`Unknown server type: ${type}`);
		}

		if (this.controls) {
			this.controls.then((controls) => {
				log.info(`Server started on ${config.port}`)
				controls.closed.then(() => {
					log.debug('Server stopped');
				});
			})
		}

		return this.controls;
	}
}
