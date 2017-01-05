import { Handler } from './handlers/handler';
import { createServer as createHttpServer, Server as HttpServer, ServerResponse, IncomingMessage } from 'http';
import { createServer as createHttpsServer, Server as HttpsServer, ServerOptions as HttpsOptions } from 'https';
import WebApplication from './WebApplication';

export interface Config {
	type: 'http' | 'https';
	port: string;
	httpsOptions?: HttpsOptions;
}

const DEFAULT_CONFIG: Config = <Config> Object.freeze({
	type: 'http',
	port: '8888'
});

export default class WebServer {
	readonly app: Handler;

	readonly config: Config;

	private _server: HttpServer | HttpsServer;

	constructor(
		config: Config = Object.assign({}, DEFAULT_CONFIG),
		handler: Handler = new WebApplication()
	) {
		this.config = config;
		this.app = handler;
	}

	start(port: string = this.config.port): Promise<any> {
		const server = this._server ? Promise.resolve(this._server) : this.createServer();
		return server
			.then((server: HttpServer | HttpsServer) => {
				return new Promise((resolve) => {
					server.listen(port, resolve);
				})
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
			if (this.config.type === 'http') {
				const server = createHttpServer((request: IncomingMessage, response: ServerResponse) => {
					return this.app.handle(request, response);
				});

				resolve(server);
			}
			else if (this.config.type === 'https') {
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
