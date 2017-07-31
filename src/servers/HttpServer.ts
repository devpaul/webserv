import { Handler } from '../handlers/Handler';
import { createServer as createHttpServer, IncomingMessage, Server, ServerResponse } from 'http';
import WebApplication from '../middleware/WebApplication';
import { BasicServer, ServerState } from './BasicServer';
import { ServerType } from '../commands/createServer';
import { log } from '../log';

export interface HttpConfig {
	port: number;
}

export default class HttpServer<T extends Handler = WebApplication> extends BasicServer<T> {
	readonly port: number;

	protected _server: Server;

	constructor(
		config: HttpConfig,
		handler: T
	) {
		super(handler);
		this.port = config.port;
	}

	get type() {
		return ServerType.HTTP;
	}

	async start(): Promise<ServerState> {
		if (this.state === ServerState.NEW) {
			this.setState(ServerState.STARTING);

			const server = this._server = this.createServer();

			server.on('close', () => {
				this._server = null;
				this.setState(ServerState.STOPPED);
			});

			server.on('error', (error: Error) => {
				log.error(`Server error: ${ error }`);
			});

			await new Promise((resolve) => {
				server.listen(this.port, () => {
					this.setState(ServerState.LISTENING);
					resolve();
				});
			});
		}

		return this.state;
	}

	async stop() {
		if (this._server) {
			this._server.close();
		}
		this._server = null;
		this.setState(ServerState.STOPPED);
	}

	protected createServer(): Server {
		return createHttpServer((request: IncomingMessage, response: ServerResponse) => {
			this.app.handle(request, response);
		});
	}
}
