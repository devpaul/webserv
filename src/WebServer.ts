import { Handler } from './handlers/Handler';
import { createServer as createHttpServer, Server as HttpServer, ServerResponse, IncomingMessage } from 'http';
import { createServer as createHttpsServer, Server as HttpsServer, ServerOptions as HttpsOptions } from 'https';
import WebApplication from './WebApplication';

export interface Config {
	type?: 'http' | 'https';
	port?: string;
	httpsOptions?: HttpsOptions;
}

const DEFAULT_CONFIG: Config = Object.freeze<Config>({
	type: 'http',
	port: '8888'
});

export type ServerType = HttpServer | HttpsServer;

export interface ServerState {
	started: Server<any>['_started'];
	listening: Server<any>['_listening'];
	closed: Server<any>['_closed'];
}

export class Server<T extends Handler> {
	readonly app: T;

	readonly config: Config;

	private _server: ServerType;

	private _started: Promise<ServerType>;

	private _listening: Promise<ServerType>;

	private _closed: Promise<void>;

	constructor(
		handler: T,
		config: Config = Object.assign({}, DEFAULT_CONFIG)
	) {
		this.app = handler;
		this.config = config;
	}

	get port() {
		return this.config.port || DEFAULT_CONFIG.port;
	}

	get type() {
		return this.config.type || DEFAULT_CONFIG.type;
	}

	get state(): ServerState {
		if (this.isRunning()) {
			return {
				started: this._started,
				listening: this._listening,
				closed: this._closed
			};
		}
		return null;
	}

	isRunning(): boolean {
		return !!this._server;
	}

	start(): Promise<ServerState> {
		if (this.isRunning()) {
			return Promise.resolve(this.state);
		}

		const server = this._started = this.createServer();

		return server
			.then((server: ServerType) => {
				this._server = server;

				this._closed = new Promise<void>((resolve) => {
					server.on('close', () => {
						this._server = null;
						resolve();
					});
				});

				this._listening = new Promise((resolve) => {
					server.listen(this.port, () => {
						resolve(server);
					});
				});

				return this.state;
			});
	}

	stop() {
		if (this._server) {
			this._server.close();
		}
		this._server = null;
	}

	private createServer(): Promise<HttpsServer | HttpsServer> {
		return new Promise((resolve, reject) => {
			if (this.type === 'http') {
				const server = createHttpServer((request: IncomingMessage, response: ServerResponse) => {
					return this.app.handle(request, response);
				});

				resolve(server);
			}
			else if (this.type === 'https') {
				const options = this.config.httpsOptions || {};
				const server = createHttpsServer(options, () => {
					resolve(server);
				});
			}
			else {
				reject(new Error(`Unknown server type "${ this.config.type }"`));
			}
		});
	}
}

export default class WebServer extends Server<WebApplication> {
	constructor(config: Config = Object.assign({}, DEFAULT_CONFIG)) {
		super(new WebApplication(), config);
	}
}
